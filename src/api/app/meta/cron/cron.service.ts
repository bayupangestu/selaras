import { SettingService } from '@/api/setting/setting.service';
import { AdAccount } from '@/migrations/ad-account.entity';
import { AdSet } from '@/migrations/ad-set.entity';
import { Ad } from '@/migrations/ad.entity';
import { Campaign } from '@/migrations/campaign.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FB } from 'fb';
import { Repository } from 'typeorm';
const axios = require('axios');

@Injectable()
export class CronService {
  private fb: FB;
  constructor(
    private readonly settingService: SettingService,

    @InjectRepository(AdAccount)
    private readonly adAccountRepository: Repository<AdAccount>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    @InjectRepository(AdSet)
    private readonly adSetRepository: Repository<AdSet>,

    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>
  ) {}

  private async initializeFB(): Promise<FB> {
    try {
      const accessToken = await this.settingService.getValue('ACCESS_TOKEN');
      FB.setAccessToken(accessToken);
      this.fb = FB;
      return this.fb;
    } catch (error) {
      throw new HttpException(
        'Failed to initialize Facebook API',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAdAccount() {
    try {
      const fb = await this.initializeFB();
      const result = await new Promise((resolve, reject) => {
        fb.api(
          '/me/adaccounts',
          'GET',
          {
            fields:
              'account_id,account_status,name,age,agency_client_declaration,amount_spent,attribution_spec,brand_safety_content_filter_levels,balance,business,business_country_code,business_city,business_name,business_state,business_street,business_street2,business_zip,can_create_brand_lift_study,capabilities,currency,created_time,custom_audience_info,default_dsa_beneficiary,default_dsa_payor,disable_reason,end_advertiser,end_advertiser_name,funding_source_details,has_migrated_permissions,id,failed_delivery_checks,fb_entity,existing_customers,expired_funding_source_details,extended_credit_invoice_group,funding_source,io_number,is_attribution_spec_system_default,is_direct_deals_enabled,is_in_3ds_authorization_enabled_market,is_notifications_enabled,is_personal,is_prepay_account,is_tax_id_required,line_numbers,media_agency,min_campaign_group_spend_cap,min_daily_budget,offsite_pixels_tos_accepted,owner,partner,rf_spec,spend_cap,tax_id,tax_id_status,tax_id_type,timezone_id,timezone_name,timezone_offset_hours_utc,tos_accepted,user_tasks,user_tos_accepted'
          },
          (response) => {
            if (!response || response.error) {
              reject(response.error);
            } else {
              resolve(response.data);
            }
          }
        );
      });

      if (Array.isArray(result)) {
        for (const account of result) {
          const existingAccount = await this.adAccountRepository.findOneBy({
            account_id: account.account_id
          });
          delete account.id;
          if (!existingAccount) {
            const newAdAccount = await this.adAccountRepository.create(account);
            await this.adAccountRepository.save(newAdAccount);
          } else {
            await this.adAccountRepository.update(
              { account_id: account.account_id },
              account
            );
          }
        }
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Ad accounts processed successfully'
      };
    } catch (error) {
      if (error?.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getCampaignList() {
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name']
    });

    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Campaign Yang Diproses'
      };
    }

    const fb = await this.initializeFB();
    let result = [];

    for (const account of accountData) {
      try {
        const campaigns = await new Promise<any[]>((resolve, reject) => {
          fb.api(
            `/act_${account.account_id}/campaigns`,
            'GET',
            {
              fields:
                'id,name,account_id,adlabels,bid_strategy,boosted_object_id,brand_lift_studies,budget_rebalance_flag,budget_remaining,buying_type,campaign_group_active_time,can_create_brand_lift_study,can_use_spend_cap,configured_status,created_time,daily_budget,effective_status,has_secondary_skadnetwork_reporting,is_budget_schedule_enabled,is_skadnetwork_attribution,issues_info,last_budget_toggling_time,lifetime_budget,objective,pacing_type,primary_attribution,promoted_object,smart_promotion_type,source_campaign,source_campaign_id,special_ad_categories,special_ad_category,special_ad_category_country,spend_cap,start_time,status,stop_time,topline_id,updated_time',
              date_preset: 'maximum'
            },
            (response) => {
              if (!response || response.error) {
                console.error(
                  `Error fetching campaigns for account ${account.account_id}:`,
                  response?.error
                );
                reject(response.error);
              } else {
                resolve(response.data);
              }
            }
          );
        });

        for (const campaignData of campaigns) {
          const existingCampaign = await this.campaignRepository.findOne({
            where: { campaign_meta_id: campaignData.id }, // Cek berdasarkan campaign_id
            relations: { ad_account: true }
          });

          campaignData.campaign_meta_id = campaignData.id;
          delete campaignData.id;
          if (!existingCampaign) {
            // Data belum ada, simpan sebagai data baru
            const accountRecord = await this.adAccountRepository.findOneBy({
              account_id: campaignData.account_id
            });
            if (!accountRecord) {
              throw new HttpException(
                `Account ${campaignData.account_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }
            campaignData.ad_account = accountRecord; // Relasi ke akun iklan
            await this.campaignRepository.save(campaignData);
          } else {
            // Data sudah ada, update
            await this.campaignRepository.update(
              { campaign_meta_id: campaignData.campaign_meta_id },
              {
                ...campaignData
              }
            );
          }
        }

        result.push(...campaigns);
      } catch (error) {
        console.error(
          `Gagal memproses campaign untuk account ${account.name}:`,
          error
        );
      }
    }

    return result;
  }

  async getAdSetList() {
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name']
    });
    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Campaign Yang Diproses'
      };
    }
    const fb = await this.initializeFB();
    let result = [];
    for (const account of accountData) {
      try {
        const adSets = await new Promise<any[]>((resolve, reject) => {
          fb.api(
            `/act_${account.account_id}/adsets`,
            'GET',
            {
              fields:
                'account_id,configured_status,campaign_id,campaign_attribution,campaign_active_time,campaign,budget_remaining,brand_safety_config,billing_event,bid_strategy,bid_info,bid_constraints,frequency_control_specs,end_time,effective_status,dsa_payor,dsa_beneficiary,destination_type,daily_spend_cap,daily_min_spend_target,daily_budget,review_feedback,start_time,time_based_ad_rotation_id_blocks,updated_time,use_new_app_click,adlabels,created_time,creative_sequence,bid_amount,bid_adjustments,attribution_spec,asset_feed_id,adset_schedule,time_based_ad_rotation_intervals,targeting_optimization_types,status,source_adset_id,rf_prediction_id,regional_regulation_identities,recurring_budget_semantics,promoted_object,targeting,source_adset,regional_regulated_categories,recommendations,pacing_type,optimization_sub_event,optimization_goal,name,multi_optimization_goal_weight,min_budget_spend_percentage, lifetime_min_spend_target,id,learning_stage_info,issues_info,lifetime_imps,lifetime_budget, is_dynamic_creative',
              date_preset: 'maximum'
            },
            (response) => {
              if (!response || response.error) {
                console.error(
                  `Error fetching campaigns for account ${account.account_id}:`,
                  response?.error
                );
                reject(response.error);
              } else {
                resolve(response.data);
              }
            }
          );
        });
        for (const adSetData of adSets) {
          const existingCampaign = await this.adSetRepository.findOne({
            where: { adset_meta_id: adSetData.id }, // Cek berdasarkan campaign_id
            relations: { campaign: true }
          });

          adSetData.adset_meta_id = adSetData.id;
          delete adSetData.id;
          if (!existingCampaign) {
            const campaignRecord = await this.campaignRepository.findOneBy({
              campaign_meta_id: adSetData.campaign_id
            });

            if (!campaignRecord) {
              // throw new HttpException(
              //   `Campaign ${adSetData.campaign_id} Tidak Ditemukan`,
              //   HttpStatus.NOT_FOUND
              // );
              delete adSetData.campaign_id;
            }
            adSetData.campaign = campaignRecord ? campaignRecord : null;
            await this.adSetRepository.save(adSetData);
          } else {
            // Data sudah ada, update
            const campaignRecord = await this.campaignRepository.findOneBy({
              campaign_meta_id: adSetData.campaign_id
            });
            if (!campaignRecord) {
              throw new HttpException(
                `Campaign ${adSetData.campaign_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }
            adSetData.campaign = campaignRecord;
            await this.adSetRepository.update(
              { adset_meta_id: adSetData.adset_meta_id },
              {
                ...adSetData
              }
            );
          }
        }
        result.push(...adSets);
      } catch (error) {
        throw new HttpException(
          `Gagal memproses adset untuk account ${account.name}, ${account.account_id}`,
          500
        );
      }
    }
    return result;
  }

  async getAdList() {
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name']
    });

    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Iklan Yang Diproses'
      };
    }

    const fb = await this.initializeFB();
    let result = [];

    for (const account of accountData) {
      try {
        const ads = await new Promise<any[]>((resolve, reject) => {
          fb.api(
            `/act_${account.account_id}/ads`,
            'GET',
            {
              fields:
                'creative,created_time,conversion_domain,configured_status,campaign_id,campaign,bid_amount,adset_id,adset,adlabels,ad_schedule_start_time,ad_schedule_end_time,ad_review_feedback,ad_active_time,account_id,tracking_specs,source_ad_id,source_ad,recommendations,preview_shareable_link,name,last_updated_by_app_id,issues_info,id,effective_status,creative_asset_groups_spec,status,updated_time',
              date_preset: 'maximum'
            },
            (response) => {
              if (!response || response.error) {
                console.error(
                  `Error fetching ads for account ${account.account_id}:`,
                  response?.error
                );
                reject(response.error);
              } else {
                resolve(response.data);
              }
            }
          );
        });

        for (const adData of ads) {
          const existingAd = await this.adRepository.findOne({
            where: { ad_meta_id: adData.id }, // Cek berdasarkan ad_meta_id
            relations: { adSet: true }
          });

          adData.ad_meta_id = adData.id; // Pindahkan id ke ad_meta_id
          delete adData.id;

          if (!existingAd) {
            const adSetRecord = await this.adSetRepository.findOneBy({
              adset_meta_id: adData.adset_id
            });

            if (!adSetRecord) {
              // Jika adSet tidak ditemukan, hapus adset_id dari adData
              delete adData.adset_id;
            }

            adData.adSet = adSetRecord ? adSetRecord : null;
            await this.adRepository.save(adData);
          } else {
            // Data sudah ada, update
            const adSetRecord = await this.adSetRepository.findOneBy({
              adset_meta_id: adData.adset_id
            });

            if (!adSetRecord) {
              throw new HttpException(
                `AdSet ${adData.adset_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }

            adData.adSet = adSetRecord;
            await this.adRepository.update(
              { ad_meta_id: adData.ad_meta_id },
              {
                ...adData
              }
            );
          }
        }
        result.push(...ads);
      } catch (error) {
        throw new HttpException(
          `Gagal memproses ads untuk account ${account.name}, ${account.account_id}`,
          500
        );
      }
    }

    return result;
  }
}
