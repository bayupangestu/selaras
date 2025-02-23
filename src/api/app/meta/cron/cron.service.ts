import { SettingService } from '@/api/cms/setting/setting.service';
import { AdAccount } from '@/entity/ad-account.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';
import { Campaign } from '@/entity/campaign.entity';
import { CustomAudience } from '@/entity/custom-audience.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';
import { Insight } from '@/entity/insight.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FB } from 'fb';
import { delay } from 'rxjs';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
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
    private readonly adRepository: Repository<Ad>,

    @InjectRepository(Insight)
    private readonly insightRepository: Repository<Insight>,

    @InjectRepository(CustomAudience)
    private readonly customAudienceRepository: Repository<CustomAudience>,

    @InjectRepository(InsightBreakdown)
    private readonly insightBreakdownRepository: Repository<InsightBreakdown>
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

  @Cron('0 1 * * *', {
    timeZone: 'Asia/Jakarta'
  })
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

  @Cron('15 1 * * *', {
    timeZone: 'Asia/Jakarta'
  })
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
        let allCampaigns = [];
        let nextPage = `/act_${account.account_id}/campaigns?fields=id,name,account_id,adlabels,bid_strategy,boosted_object_id,brand_lift_studies,budget_rebalance_flag,budget_remaining,buying_type,campaign_group_active_time,can_create_brand_lift_study,can_use_spend_cap,configured_status,created_time,daily_budget,effective_status,has_secondary_skadnetwork_reporting,is_budget_schedule_enabled,is_skadnetwork_attribution,issues_info,last_budget_toggling_time,lifetime_budget,objective,pacing_type,primary_attribution,promoted_object,smart_promotion_type,source_campaign,source_campaign_id,special_ad_categories,special_ad_category,special_ad_category_country,spend_cap,start_time,status,stop_time,topline_id,updated_time&date_preset=this_month&limit=1000`;

        while (nextPage) {
          const response = await new Promise<any>((resolve, reject) => {
            fb.api(nextPage, 'GET', {}, (res) => {
              if (!res || res.error) {
                console.error(
                  `Error fetching campaigns for account ${account.account_id}:`,
                  res?.error
                );
                reject(res?.error);
              } else {
                resolve(res);
              }
            });
          });

          if (response.data) {
            allCampaigns.push(...response.data);
          }

          nextPage = response.paging?.next || null;
        }

        for (const campaignData of allCampaigns) {
          const existingCampaign = await this.campaignRepository.findOne({
            where: { campaign_meta_id: campaignData.id },
            relations: { ad_account: true }
          });

          campaignData.campaign_meta_id = campaignData.id;
          delete campaignData.id;

          if (!existingCampaign) {
            const accountRecord = await this.adAccountRepository.findOneBy({
              account_id: campaignData.account_id
            });

            if (!accountRecord) {
              throw new HttpException(
                `Account ${campaignData.account_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }

            campaignData.ad_account = accountRecord;
            await this.campaignRepository.save(campaignData);
          } else {
            await this.campaignRepository.update(
              { campaign_meta_id: campaignData.campaign_meta_id },
              { ...campaignData }
            );
          }
        }

        result.push(...allCampaigns);
      } catch (error) {
        console.error(
          `Gagal memproses campaign untuk account ${account.name}:`,
          error
        );
      }
    }

    return result;
  }

  @Cron('30 1 * * *', {
    timeZone: 'Asia/Jakarta'
  })
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
        let allAdSets = [];
        // Define base fields that we want to fetch
        const fields = [
          'account_id',
          'configured_status',
          'campaign_id',
          'campaign_attribution',
          'campaign_active_time',
          'campaign',
          'budget_remaining',
          'brand_safety_config',
          'billing_event',
          'bid_strategy',
          'bid_info',
          'bid_constraints',
          'frequency_control_specs',
          'end_time',
          'effective_status',
          'dsa_payor',
          'dsa_beneficiary',
          'destination_type',
          'daily_spend_cap',
          'daily_min_spend_target',
          'daily_budget',
          'review_feedback',
          'start_time',
          'time_based_ad_rotation_id_blocks',
          'updated_time',
          'use_new_app_click',
          'adlabels',
          'created_time',
          'creative_sequence',
          'bid_amount',
          'bid_adjustments',
          'attribution_spec',
          'asset_feed_id',
          'adset_schedule',
          'time_based_ad_rotation_intervals',
          'targeting_optimization_types',
          'status',
          'source_adset_id',
          'rf_prediction_id',
          'regional_regulation_identities',
          'recurring_budget_semantics',
          'promoted_object',
          'targeting',
          'source_adset',
          'regional_regulated_categories',
          'recommendations',
          'pacing_type',
          'optimization_sub_event',
          'optimization_goal',
          'name',
          'multi_optimization_goal_weight',
          'min_budget_spend_percentage',
          'lifetime_min_spend_target',
          'id',
          'learning_stage_info',
          'issues_info',
          'lifetime_imps',
          'lifetime_budget',
          'is_dynamic_creative'
        ].join(',');

        // Start with the initial request URL
        let currentRequest = `/act_${account.account_id}/adsets`;

        while (currentRequest) {
          try {
            const response = await new Promise<any>((resolve, reject) => {
              const params = {
                fields,
                date_preset: 'this_month',
                limit: 200
              };

              fb.api(currentRequest, 'GET', params, (res) => {
                if (!res || res.error) {
                  console.error(
                    `Error fetching adsets for account ${account.account_id}, ${account.name}:`,
                    res?.error
                  );
                  reject(res?.error);
                } else {
                  resolve(res);
                }
              });
            });

            if (response.data) {
              allAdSets.push(...response.data);
            }

            // Handle pagination using the raw next URL if it exists
            currentRequest = response.paging?.next
              ? new URL(response.paging.next).pathname +
                new URL(response.paging.next).search
              : null;
          } catch (error) {
            console.error(
              `Error in pagination loop for account ${account.account_id}:`,
              error
            );
            throw error;
          }
        }

        // Process the collected adsets
        for (const adSetData of allAdSets) {
          const existingCampaign = await this.adSetRepository.findOne({
            where: { adset_meta_id: adSetData.id },
            relations: { campaign: true }
          });

          adSetData.adset_meta_id = adSetData.id;
          delete adSetData.id;

          if (!existingCampaign) {
            const campaignRecord = await this.campaignRepository.findOneBy({
              campaign_meta_id: adSetData.campaign_id
            });

            if (!campaignRecord) {
              adSetData.campaign_meta_id = adSetData.campaign_id;
              delete adSetData.campaign_id;
            }
            adSetData.campaign = campaignRecord ? campaignRecord : null;
            await this.adSetRepository.save(adSetData);
          } else {
            const campaignRecord = await this.campaignRepository.findOneBy({
              campaign_meta_id: adSetData.campaign_id
            });

            if (!campaignRecord) {
              throw new HttpException(
                `Campaign ${adSetData.campaign_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }
            adSetData.campaign_meta_id = adSetData.campaign_id;
            delete adSetData.campaign_id;
            adSetData.campaign = campaignRecord;
            await this.adSetRepository.update(
              { adset_meta_id: adSetData.adset_meta_id },
              {
                ...adSetData
              }
            );
          }
        }

        result.push(...allAdSets);
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error);
        throw new HttpException(
          `Gagal memproses adset untuk account ${account.name}, ${account.account_id}`,
          500
        );
      }
    }

    return result;
  }

  @Cron('45 1 * * *', {
    timeZone: 'Asia/Jakarta'
  })
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
        let allAds = [];
        // Define base fields that we want to fetch
        const fields = [
          'creative',
          'created_time',
          'conversion_domain',
          'configured_status',
          'campaign_id',
          'campaign',
          'bid_amount',
          'adset_id',
          'adset',
          'adlabels',
          'ad_schedule_start_time',
          'ad_schedule_end_time',
          'ad_review_feedback',
          'ad_active_time',
          'account_id',
          'tracking_specs',
          'source_ad_id',
          'source_ad',
          'recommendations',
          'preview_shareable_link',
          'name',
          'last_updated_by_app_id',
          'issues_info',
          'id',
          'effective_status',
          'creative_asset_groups_spec',
          'status',
          'updated_time'
        ].join(',');

        // Start with the initial request URL
        let currentRequest = `/act_${account.account_id}/ads`;

        while (currentRequest) {
          try {
            const response = await new Promise<any>((resolve, reject) => {
              const params = {
                fields,
                date_preset: 'this_month',
                limit: 200
              };

              fb.api(currentRequest, 'GET', params, (res) => {
                if (!res || res.error) {
                  console.error(
                    `Error fetching ads for account ${account.account_id}, ${account.name}:`,
                    res?.error
                  );
                  reject(res?.error);
                } else {
                  resolve(res);
                }
              });
            });

            if (response.data) {
              allAds.push(...response.data);
            }

            // Handle pagination using the raw next URL if it exists
            currentRequest = response.paging?.next
              ? new URL(response.paging.next).pathname +
                new URL(response.paging.next).search
              : null;
          } catch (error) {
            console.error(
              `Error in pagination loop for account ${account.account_id}:`,
              error
            );
            throw error;
          }
        }

        // Process the collected ads
        for (const adData of allAds) {
          const existingAd = await this.adRepository.findOne({
            where: { ad_meta_id: adData.id },
            relations: { ad_set_id: true }
          });

          adData.ad_meta_id = adData.id;
          delete adData.id;

          const adSetRecord = await this.adSetRepository.findOne({
            relations: {
              campaign: true
            },
            where: {
              adset_meta_id: adData.adset_id
            }
          });
          if (!adSetRecord) {
            throw new HttpException(
              `AdSet ${adData.adset_id} Tidak Ditemukan`,
              HttpStatus.NOT_FOUND
            );
          }
          if (!existingAd) {
            if (!adSetRecord) {
              delete adData.adset_id;
            }

            adData.adSet = adSetRecord ? adSetRecord : null;
            adData.campaign_id = adSetRecord.campaign;
            await this.adRepository.save(adData);
          } else {
            adData.ad_set_id = adSetRecord;
            adData.campaign_id = adSetRecord.campaign;

            await this.adRepository.update(
              { ad_meta_id: adData.ad_meta_id },
              {
                ...adData
              }
            );
          }
        }

        result.push(...allAds);
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error);
        throw new HttpException(
          `Gagal memproses ads untuk account ${account.name}, ${account.account_id}`,
          500
        );
      }
    }

    return result;
  }

  async fetchInsightsWithRetry(path, dateRange, fieldChunk, breakdowns) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const option = {
          fields: fieldChunk,
          date_preset: 'yesterday',
          time_range: { since: '2024-11-20', until: '2024-11-20' },
          breakdowns,
          limit: 100
        };
        if (dateRange === null) {
          delete option.time_range;
        } else {
          delete option.date_preset;
        }

        const fb = await this.initializeFB();
        const response: any = await new Promise((resolve, reject) => {
          fb.api(
            path,
            'GET',
            {
              ...option
            },
            (res) => {
              if (!res || res.error) {
                reject(res?.error);
              } else {
                resolve(res);
              }
            }
          );
        });
        if (response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        attempts++;
        if (
          error.code === 2 ||
          error.error_subcode === 1504018 ||
          error.code === 80000 ||
          error.error_subcode === 2446079
        ) {
          console.log('masuk error delay', attempts);
          await delay(5000 * attempts);
          continue;
        }

        if (attempts === maxAttempts) {
          console.warn(
            `Failed to fetch chunk for ${path}, continuing with partial data`
          );
          return null;
        }
      }
    }
  }

  async saveInsights(insightDataArray, referenceType, referenceId) {
    try {
      if (!Array.isArray(insightDataArray)) {
        insightDataArray = [insightDataArray];
      }
      for (const insightData of insightDataArray) {
        if (Object.keys(insightData).length > 0) {
          insightData.reference_type = referenceType;
          insightData.referenceId = referenceId;
          insightData.date = insightData.date_start;
          delete insightData.date_start;

          switch (referenceType) {
            case 'ad_account':
              insightData.ad_account_id =
                await this.adAccountRepository.findOneBy({
                  id: referenceId
                });
              break;
            case 'campaign':
              insightData.campaign_id = await this.campaignRepository.findOneBy(
                {
                  id: referenceId
                }
              );
              break;
            case 'adset':
              insightData.adset_id = await this.adSetRepository.findOneBy({
                id: referenceId
              });
              break;
            case 'ad':
              insightData.ad_id = await this.adRepository.findOneBy({
                id: referenceId
              });
              delete insightData.ad_id.tracking_specs;
              break;
            default:
              throw new HttpException(
                'Invalid reference type',
                HttpStatus.BAD_REQUEST
              );
          }
          const actions = insightData?.actions?.reduce((acc, action) => {
            acc[action.action_type] = parseInt(action.value, 10);
            return acc;
          }, {});

          const costPerAction = insightData?.cost_per_action_type?.reduce(
            (acc, action) => {
              acc[action.action_type] = parseFloat(action.value);
              return acc;
            },
            {}
          );

          insightData.link_click = actions?.link_click || 0;
          if (insightData.link_click > 0) {
            insightData.ctr = Math.ceil(
              insightData.link_click / insightData.impression
            );
          } else {
            insightData.ctr = 0;
          }
          insightData.post_engagement = actions?.post_engagement || 0;
          insightData.video_views = actions?.video_view || 0;
          insightData.lead = actions?.lead || 0;

          // CPM - Cost per Mile

          insightData.cost_per_mile =
            insightData.spend &&
            insightData.reach &&
            parseFloat(insightData.reach) > 0
              ? Math.ceil(
                  (parseFloat(insightData.spend) /
                    parseFloat(insightData.reach)) *
                    1000
                )
              : 0;

          // CPE - Cost per Engagement
          // const totalEngagement =
          //   (actions?.post_engagement || 0) +
          //   (actions?.page_engagement || 0) +
          //   (actions?.like || 0) +
          //   (actions?.comment || 0);

          insightData.cost_per_engagement =
            insightData.spend && insightData.post_engagement > 0
              ? Math.ceil(
                  parseFloat(insightData.spend) / insightData.post_engagement
                )
              : 0;

          // CPV - Cost per View
          insightData.cost_per_view =
            insightData.spend && actions?.video_view > 0
              ? Math.ceil(parseFloat(insightData.spend) / actions.video_view)
              : 0;

          // CPC - Cost per Click
          insightData.cost_per_click =
            insightData.spend && actions?.link_click > 0
              ? Math.ceil(parseFloat(insightData.spend) / actions.link_click)
              : 0;

          // CPL - Cost per Lead
          insightData.cost_per_lead =
            insightData.spend && actions?.lead > 0
              ? Math.ceil(parseFloat(insightData.spend) / actions.lead)
              : 0;

          // Menyimpan breakdowns jika ada
          if (
            insightData.gender ||
            insightData.age ||
            insightData.country ||
            insightData.region ||
            insightData.publisher_platform ||
            insightData.device_platform
          ) {
            const breakdown = await this.insightBreakdownRepository.findOne({
              where: {
                gender: insightData.gender,
                age: insightData.age,
                country: insightData.country,
                region: insightData.region,
                publisher_platform: insightData.publisher_platform,
                device_platform: insightData.device_platform
              }
            });
            if (!breakdown) {
              const newBreakdown = new InsightBreakdown();
              newBreakdown.gender = insightData.gender;
              newBreakdown.age = insightData.age;
              newBreakdown.country = insightData.country;
              newBreakdown.region = insightData.region;
              newBreakdown.publisher_platform = insightData.publisher_platform;
              newBreakdown.device_platform = insightData.device_platform;
              const result = await this.insightBreakdownRepository.save(
                newBreakdown
              );
              insightData.insight_breakdown_id = result;
            } else {
              insightData.insight_breakdown_id = breakdown;
            }
          }
          await this.insightRepository.save(insightData);
        }
      }
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async processAdAccountInsights(account, dateRange, fieldChunks) {
    const path = `/act_${account.account_id}/insights`;
    const insights = await this.fetchInsightsForEntity(
      path,
      dateRange,
      fieldChunks
    );
    if (insights === null) {
      return null;
    }
    await this.saveInsights(insights, 'ad_account', account.id);
  }

  async fetchInsightsForEntity(path, dateRange, fieldChunks, breakdowns?: any) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1000);

    const chunkData = await this.fetchInsightsWithRetry(
      path,
      dateRange,
      fieldChunks,
      breakdowns
    );

    return chunkData && chunkData.length > 0 ? chunkData : null;
  }

  async processInsights(entityType, entity, dateRange, fieldChunks) {
    const path = `/${entity[`${entityType}_meta_id`]}/insights`;

    const insightsWithoutBreakdown = await this.fetchInsightsForEntity(
      path,
      dateRange,
      fieldChunks,
      null
    );

    if (insightsWithoutBreakdown === null) return null;

    for (const insight of insightsWithoutBreakdown) {
      await this.saveInsights(insight, entityType, entity.id);
    }

    const breakdownCombinations = [
      'gender',
      'age',
      'country',
      'region',
      'publisher_platform',
      'device_platform'
    ];

    for (const breakdown of breakdownCombinations) {
      const insights = await this.fetchInsightsForEntity(
        path,
        dateRange,
        fieldChunks,
        breakdown
      );

      if (insights === null) {
        break;
      }
      for (const insight of insights) {
        await this.saveInsights(insight, entityType, entity.id);
      }
    }
  }

  async processCampaignInsights(campaign, dateRange, fieldChunks) {
    return await this.processInsights(
      'campaign',
      campaign,
      dateRange,
      fieldChunks
    );
  }

  async processAdSetInsights(adSet, dateRange, fieldChunks) {
    return await this.processInsights('adset', adSet, dateRange, fieldChunks);
  }

  async processAdInsights(ad, dateRange, fieldChunks) {
    return await this.processInsights('ad', ad, dateRange, fieldChunks);
  }

  async getInsights(body: any) {
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name']
    });

    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Yang Diproses'
      };
    }

    const fb = await this.initializeFB();
    // const fieldChunks = [
    //   // Core metrics chunk
    //   [
    //     'reach',
    //     'impressions',
    //     'clicks',
    //     'spend',
    //     'ctr',
    //     'cpc',
    //     'cpm',
    //     'date_start',
    //     'date_stop'
    //   ],
    //   // Video metrics chunk
    //   [
    //     'video_30_sec_watched_actions',
    //     'video_avg_time_watched_actions',
    //     'video_play_actions'
    //   ],
    //   // Cost metrics chunk
    //   [
    //     'cost_per_outbound_click',
    //     'cost_per_thruplay',
    //     'cost_per_unique_action_type'
    //   ],
    //   // Engagement metrics chunk
    //   [
    //     'engagement_rate_ranking',
    //     'estimated_ad_recall_rate',
    //     'inline_link_click_ctr',
    //     'inline_post_engagement'
    //   ],
    //   // Additional metrics chunk
    //   [
    //     'website_ctr',
    //     'purchase_roas',
    //     'quality_ranking',
    //     'actions',
    //     'spend',
    //     'cost_per_action_type'
    //   ]
    // ];
    const fieldChunks = [
      'reach',
      'impressions',
      'clicks',
      'spend',
      'ctr',
      'cpc',
      'cpm',
      'date_start',
      'date_stop',
      'video_30_sec_watched_actions',
      'video_avg_time_watched_actions',
      'video_play_actions',
      'cost_per_outbound_click',
      'cost_per_thruplay',
      'cost_per_unique_action_type',
      'engagement_rate_ranking',
      'estimated_ad_recall_rate',
      'inline_link_click_ctr',
      'inline_post_engagement',
      'website_ctr',
      'purchase_roas',
      'quality_ranking',
      'actions',
      'cost_per_action_type'
    ];
    const today = new Date();
    today.setDate(today.getDate() - 1);
    if (!body.date) {
      throw new HttpException('Date is required', 400);
    }
    for (const account of accountData) {
      try {
        const adAccountData = await this.processAdAccountInsights(
          account,
          body.date,
          fieldChunks
        );
        if (adAccountData === null) {
          continue;
        }
        const campaigns = await this.campaignRepository.find({
          where: { account_id: account.account_id }
        });
        for (const campaign of campaigns) {
          const campaignData = await this.processCampaignInsights(
            campaign,
            body.date,
            fieldChunks
          );
          if (campaignData === null) {
            continue;
          }
          const adSets = await this.adSetRepository.find({
            where: { campaign_meta_id: campaign.campaign_meta_id }
          });
          for (const adSet of adSets) {
            const adSetData = await this.processAdSetInsights(
              adSet,
              body.date,
              fieldChunks
            );
            if (adSetData === null) {
              continue;
            }
            const ads = await this.adRepository.find({
              where: { adset_id: adSet.adset_meta_id }
            });
            for (const ad of ads) {
              await this.processAdInsights(ad, body.date, fieldChunks);
            }
          }
        }
      } catch (error) {
        console.error(
          `Error processing insights for account ${account.account_id}:`,
          error
        );
        console.warn(`Skipping account ${account.account_id} due to error`);
      }
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Insights processed successfully'
    };
  }

  @Cron('0 2 * * *', {
    timeZone: 'Asia/Jakarta'
  })
  async getInsightsCron() {
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name']
    });

    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Yang Diproses'
      };
    }

    const fb = await this.initializeFB();
    // const fieldChunks = [
    //   // Core metrics chunk
    //   [
    //     'reach',
    //     'impressions',
    //     'clicks',
    //     'spend',
    //     'ctr',
    //     'cpc',
    //     'cpm',
    //     'date_start',
    //     'date_stop'
    //   ],
    //   // Video metrics chunk
    //   [
    //     'video_30_sec_watched_actions',
    //     'video_avg_time_watched_actions',
    //     'video_play_actions'
    //   ],
    //   // Cost metrics chunk
    //   [
    //     'cost_per_outbound_click',
    //     'cost_per_thruplay',
    //     'cost_per_unique_action_type'
    //   ],
    //   // Engagement metrics chunk
    //   [
    //     'engagement_rate_ranking',
    //     'estimated_ad_recall_rate',
    //     'inline_link_click_ctr',
    //     'inline_post_engagement'
    //   ],
    //   // Additional metrics chunk
    //   [
    //     'website_ctr',
    //     'purchase_roas',
    //     'quality_ranking',
    //     'actions',
    //     'spend',
    //     'cost_per_action_type'
    //   ]
    // ];
    const fieldChunks = [
      'reach',
      'impressions',
      'clicks',
      'spend',
      'ctr',
      'cpc',
      'cpm',
      'date_start',
      'date_stop',
      'video_30_sec_watched_actions',
      'video_avg_time_watched_actions',
      'video_play_actions',
      'cost_per_outbound_click',
      'cost_per_thruplay',
      'cost_per_unique_action_type',
      'engagement_rate_ranking',
      'estimated_ad_recall_rate',
      'inline_link_click_ctr',
      'inline_post_engagement',
      'website_ctr',
      'purchase_roas',
      'quality_ranking',
      'actions',
      'cost_per_action_type'
    ];
    const today = new Date();
    today.setDate(today.getDate() - 1);

    for (const account of accountData) {
      try {
        const adAccountData = await this.processAdAccountInsights(
          account,
          null,
          fieldChunks
        );
        if (adAccountData === null) {
          continue;
        }
        const campaigns = await this.campaignRepository.find({
          where: { account_id: account.account_id }
        });
        for (const campaign of campaigns) {
          const campaignData = await this.processCampaignInsights(
            campaign,
            null,
            fieldChunks
          );
          if (campaignData === null) {
            continue;
          }
          const adSets = await this.adSetRepository.find({
            where: { campaign_meta_id: campaign.campaign_meta_id }
          });
          for (const adSet of adSets) {
            const adSetData = await this.processAdSetInsights(
              adSet,
              null,
              fieldChunks
            );
            if (adSetData === null) {
              continue;
            }
            const ads = await this.adRepository.find({
              where: { adset_id: adSet.adset_meta_id }
            });
            for (const ad of ads) {
              await this.processAdInsights(ad, null, fieldChunks);
            }
          }
        }
      } catch (error) {
        console.error(
          `Error processing insights for account ${account.account_id}:`,
          error
        );
        console.warn(`Skipping account ${account.account_id} due to error`);
      }
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Insights processed successfully'
    };
  }

  async getCustomAudienceList() {
    // Ambil semua akun iklan dari database
    const accountData = await this.adAccountRepository.find({
      select: ['name', 'account_id', 'business_name', 'id']
    });

    if (accountData.length < 1) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tidak Ada Data Akun Iklan Yang Ditemukan'
      };
    }

    const fb = await this.initializeFB();
    let result = [];

    for (const account of accountData) {
      try {
        let allAudiences = [];
        let nextPage = `/act_${account.account_id}/customaudiences?fields=id,data_source,customer_file_source,approximate_count_upper_bound,description,approximate_count_lower_bound,time_created,subtype,rule_aggregation,rule,retention_days,pixel_id,permission_for_actions,page_deletion_marked_delete_time,opt_out_link,operation_status,name,lookalike_spec,lookalike_audience_ids,is_value_based,time_updated,time_content_updated,sharing_status,delivery_status&limit=1000`;

        while (nextPage) {
          const response = await new Promise<any>((resolve, reject) => {
            fb.api(nextPage, 'GET', {}, (res) => {
              if (!res || res.error) {
                console.error(
                  `Error fetching custom audiences for account ${account.account_id}:`,
                  res?.error
                );
                reject(res?.error);
              } else {
                resolve(res);
              }
            });
          });

          if (response.data) {
            allAudiences.push(...response.data);
          }

          nextPage = response.paging?.next || null;
        }

        for (const audienceData of allAudiences) {
          const existingAudience = await this.customAudienceRepository.findOne({
            where: { audience_meta_id: audienceData.id },
            relations: { ad_account_id: true }
          });

          // Map the audience data to match the entity structure
          audienceData.audience_meta_id = audienceData.id; // Use a unique identifier
          audienceData.ad_account_id = account.id;
          audienceData.time_created = audienceData.time_created
            ? new Date(audienceData.time_created * 1000)
            : null;
          audienceData.time_updated = audienceData.time_updated
            ? new Date(audienceData.time_updated * 1000)
            : null;

          delete audienceData.id;

          if (!existingAudience) {
            const accountRecord = await this.adAccountRepository.findOneBy({
              account_id: account.account_id
            });

            if (!accountRecord) {
              throw new HttpException(
                `Account ${account.account_id} Tidak Ditemukan`,
                HttpStatus.NOT_FOUND
              );
            }

            audienceData.ad_account = accountRecord;

            await this.customAudienceRepository.save(audienceData);
          } else {
            await this.customAudienceRepository.update(
              { audience_meta_id: audienceData.audience_meta_id },
              { ...audienceData }
            );
          }
        }

        result.push(...allAudiences);
      } catch (error) {
        console.error(
          `Gagal memproses custom audiences untuk account ${account.name}:`,
          error
        );
      }
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Custom Audiences Diproses Berhasil',
      data: result
    };
  }
}
