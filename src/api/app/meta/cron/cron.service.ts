import { SettingService } from '@/api/cms/setting/setting.service';
import { AdAccount } from '@/migrations/ad-account.entity';
import { AdSet } from '@/migrations/ad-set.entity';
import { Ad } from '@/migrations/ad.entity';
import { Campaign } from '@/migrations/campaign.entity';
import { Insight } from '@/migrations/insight.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FB } from 'fb';
import { delay } from 'rxjs';
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
    private readonly adRepository: Repository<Ad>,

    @InjectRepository(Insight)
    private readonly insightRepository: Repository<Insight>
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
        let allCampaigns = [];
        let nextPage = `/act_${account.account_id}/campaigns?fields=id,name,account_id,adlabels,bid_strategy,boosted_object_id,brand_lift_studies,budget_rebalance_flag,budget_remaining,buying_type,campaign_group_active_time,can_create_brand_lift_study,can_use_spend_cap,configured_status,created_time,daily_budget,effective_status,has_secondary_skadnetwork_reporting,is_budget_schedule_enabled,is_skadnetwork_attribution,issues_info,last_budget_toggling_time,lifetime_budget,objective,pacing_type,primary_attribution,promoted_object,smart_promotion_type,source_campaign,source_campaign_id,special_ad_categories,special_ad_category,special_ad_category_country,spend_cap,start_time,status,stop_time,topline_id,updated_time&date_preset=maximum&limit=1000`;

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
                date_preset: 'maximum',
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
                date_preset: 'maximum',
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
            relations: { adSet: true }
          });

          adData.ad_meta_id = adData.id;
          delete adData.id;

          if (!existingAd) {
            const adSetRecord = await this.adSetRepository.findOneBy({
              adset_meta_id: adData.adset_id
            });

            if (!adSetRecord) {
              delete adData.adset_id;
            }

            adData.adSet = adSetRecord ? adSetRecord : null;
            await this.adRepository.save(adData);
          } else {
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

  // async getInsights() {
  //   const accountData = await this.adAccountRepository.find({
  //     select: ['name', 'account_id', 'business_name']
  //   });

  //   if (accountData.length < 1) {
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Tidak Ada Data Yang Diproses'
  //     };
  //   }

  //   const fb = await this.initializeFB();
  //   const result = [];

  //   // Break down fields into smaller chunks for better performance
  //   const fieldChunks = [
  //     // Core metrics chunk
  //     [
  //       'reach',
  //       'impressions',
  //       'clicks',
  //       'spend',
  //       'ctr',
  //       'cpc',
  //       'cpm',
  //       'date_start',
  //       'date_stop'
  //     ],

  //     // Video metrics chunk
  //     [
  //       'video_30_sec_watched_actions',
  //       'video_avg_time_watched_actions',
  //       'video_play_actions',
  //       'video_p25_watched_actions',
  //       'video_p50_watched_actions',
  //       'video_p75_watched_actions',
  //       'video_p95_watched_actions',
  //       'video_p100_watched_actions'
  //     ],

  //     // Cost metrics chunk
  //     [
  //       'cost_per_outbound_click',
  //       'cost_per_thruplay',
  //       'cost_per_unique_action_type',
  //       'cost_per_unique_click',
  //       'cost_per_unique_inline_link_click',
  //       'cost_per_unique_outbound_click',
  //       'cost_per_action_type',
  //       'cost_per_conversion',
  //       'cost_per_inline_post_engagement'
  //     ],

  //     // Engagement metrics chunk
  //     [
  //       'engagement_rate_ranking',
  //       'estimated_ad_recall_rate',
  //       'estimated_ad_recallers',
  //       'inline_link_click_ctr',
  //       'inline_link_clicks',
  //       'inline_post_engagement'
  //     ],

  //     // Additional metrics chunk
  //     [
  //       'website_ctr',
  //       'website_purchase_roas',
  //       'purchase_roas',
  //       'quality_ranking',
  //       'place_page_name',
  //       'marketing_messages_delivery_rate'
  //     ]
  //   ];

  //   const getDateRanges = () => {
  //     const ranges = [];
  //     const startDate = new Date('2024-10-01'); // Tanggal mulai: 1 Oktober 2024
  //     const endDate = new Date('2024-11-30'); // Tanggal berakhir: 30 November 2024

  //     let currentDate = new Date(startDate);
  //     while (currentDate <= endDate) {
  //       const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  //       ranges.push({
  //         since: dateStr,
  //         until: dateStr
  //       });
  //       currentDate.setDate(currentDate.getDate() + 1); // Pindah ke hari berikutnya
  //     }
  //     return ranges;
  //   };

  //   // Helper function to merge insights from different chunks
  //   const mergeInsights = (existingInsight, newData) => {
  //     return {
  //       ...existingInsight,
  //       ...newData
  //     };
  //   };

  //   // Helper function to fetch insights with rate limiting and chunking
  //   const fetchInsightsWithRetry = async (path, dateRange, fieldChunk) => {
  //     const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  //     let attempts = 0;
  //     const maxAttempts = 3;

  //     while (attempts < maxAttempts) {
  //       try {
  //         const response: any = await new Promise((resolve, reject) => {
  //           fb.api(
  //             path,
  //             'GET',
  //             {
  //               fields: fieldChunk.join(','),
  //               time_range: dateRange,
  //               limit: 100
  //             },
  //             (res) => {
  //               if (!res || res.error) {
  //                 reject(res?.error);
  //               } else {
  //                 resolve(res);
  //               }
  //             }
  //           );
  //         });
  //         if (response.data) {
  //           return response.data;
  //         }
  //         return null;
  //       } catch (error) {
  //         attempts++;
  //         if (error.code === 2 && error.error_subcode === 1504018) {
  //           await delay(5000 * attempts);
  //           continue;
  //         }
  //         if (attempts === maxAttempts) {
  //           console.warn(
  //             `Failed to fetch chunk for ${path}, continuing with partial data`
  //           );
  //           return null;
  //         }
  //       }
  //     }
  //   };

  //   const dateRanges = getDateRanges();
  //   const processedInsights = new Map(); // Cache for merging chunks

  //   // Process each account
  //   for (const account of accountData) {
  //     try {
  //       // Process each date range
  //       for (const dateRange of dateRanges) {
  //         let mergedData: any = {};

  //         // Fetch each chunk of fields
  //         for (const fieldChunk of fieldChunks) {
  //           await delay(1000); // Rate limiting delay between chunks
  //           // `/act_${account.account_id}/insights`,
  //           const chunkData = await fetchInsightsWithRetry(
  //             `/act_327016482341703/insights`,
  //             dateRange,
  //             fieldChunk
  //           );

  //           if (chunkData && chunkData[0]) {
  //             mergedData = mergeInsights(mergedData, chunkData[0]);
  //           }
  //         }

  //         // Only save if we have data
  //         if (Object.keys(mergedData).length > 0) {
  //           mergedData.reference_type = 'ad_account';
  //           mergedData.referenceId = 'act_327016482341703';
  //           mergedData.date = mergedData.date_start;
  //           delete mergedData.date_start;
  //           const insightData = await this.insightRepository.create(mergedData);
  //           console.log(insightData);
  //           await this.insightRepository.save(insightData);
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error, '<<<<');
  //       throw new HttpException(error, 500);
  //       console.error(
  //         `Error processing insights for account ${account.account_id}:`,
  //         error
  //       );
  //       // Continue with next account instead of throwing
  //       console.warn(`Skipping account ${account.account_id} due to error`);
  //     }
  //   }

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'Insights processed successfully'
  //   };
  // }

  // async getInsights() {
  //   const accountData = await this.adAccountRepository.find({
  //     select: ['name', 'account_id', 'business_name']
  //   });

  //   if (accountData.length < 1) {
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Tidak Ada Data Yang Diproses'
  //     };
  //   }

  //   const fb = await this.initializeFB();
  //   const fieldChunks = [
  //     // Core metrics chunk
  //     [
  //       'reach',
  //       'impressions',
  //       'clicks',
  //       'spend',
  //       'ctr',
  //       'cpc',
  //       'cpm',
  //       'date_start',
  //       'date_stop'
  //     ],
  //     // Video metrics chunk
  //     [
  //       'video_30_sec_watched_actions',
  //       'video_avg_time_watched_actions',
  //       'video_play_actions',
  //       'video_p25_watched_actions',
  //       'video_p50_watched_actions',
  //       'video_p75_watched_actions',
  //       'video_p95_watched_actions',
  //       'video_p100_watched_actions'
  //     ],
  //     // Cost metrics chunk
  //     [
  //       'cost_per_outbound_click',
  //       'cost_per_thruplay',
  //       'cost_per_unique_action_type',
  //       'cost_per_unique_click',
  //       'cost_per_unique_inline_link_click',
  //       'cost_per_unique_outbound_click',
  //       'cost_per_action_type',
  //       'cost_per_conversion',
  //       'cost_per_inline_post_engagement'
  //     ],
  //     // Engagement metrics chunk
  //     [
  //       'engagement_rate_ranking',
  //       'estimated_ad_recall_rate',
  //       'estimated_ad_recallers',
  //       'inline_link_click_ctr',
  //       'inline_link_clicks',
  //       'inline_post_engagement'
  //     ],
  //     // Additional metrics chunk
  //     [
  //       'website_ctr',
  //       'website_purchase_roas',
  //       'purchase_roas',
  //       'quality_ranking',
  //       'place_page_name',
  //       'marketing_messages_delivery_rate'
  //     ]
  //   ];

  //   // Get today's date range
  //   const getDateRangeForToday = () => {
  //     const today = new Date();
  //     const dateStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  //     return {
  //       since: dateStr,
  //       until: dateStr
  //     };
  //   };

  //   const mergeInsights = (existingInsight, newData) => {
  //     return {
  //       ...existingInsight,
  //       ...newData
  //     };
  //   };

  //   const fetchInsightsWithRetry = async (path, dateRange, fieldChunk) => {
  //     const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  //     let attempts = 0;
  //     const maxAttempts = 3;
  //     while (attempts < maxAttempts) {
  //       try {
  //         const response: any = await new Promise((resolve, reject) => {
  //           fb.api(
  //             path,
  //             'GET',
  //             {
  //               fields: fieldChunk.join(','),
  //               time_range: dateRange,
  //               limit: 100
  //             },
  //             (res) => {
  //               if (!res || res.error) {
  //                 reject(res?.error);
  //               } else {
  //                 resolve(res);
  //               }
  //             }
  //           );
  //         });
  //         if (response.data) {
  //           return response.data;
  //         }
  //         return null;
  //       } catch (error) {
  //         attempts++;
  //         if (error.code === 2 && error.error_subcode === 1504018) {
  //           await delay(5000 * attempts);
  //           continue;
  //         }
  //         if (attempts === maxAttempts) {
  //           console.warn(
  //             `Failed to fetch chunk for ${path}, continuing with partial data`
  //           );
  //           return null;
  //         }
  //       }
  //     }
  //   };

  //   const dateRange = getDateRangeForToday(); // Single date range for today

  //   // Process each account
  //   for (const account of accountData) {
  //     try {
  //       // Fetch campaigns for the account
  //       const campaigns = await this.campaignRepository.find({
  //         where: { ad_account: account }
  //       });

  //       // Fetch insights for AdAccount
  //       let mergedAccountData: any = {};
  //       for (const fieldChunk of fieldChunks) {
  //         await delay(1000); // Rate limiting delay between chunks
  //         const accountChunkData = await fetchInsightsWithRetry(
  //           `/act_${account.account_id}/insights`,
  //           dateRange,
  //           fieldChunk
  //         );
  //         if (accountChunkData && accountChunkData[0]) {
  //           mergedAccountData = mergeInsights(
  //             mergedAccountData,
  //             accountChunkData[0]
  //           );
  //         }
  //       }
  //       if (Object.keys(mergedAccountData).length > 0) {
  //         mergedAccountData.reference_type = 'ad_account';
  //         mergedAccountData.referenceId = `act_${account.account_id}`;
  //         mergedAccountData.date = mergedAccountData.date_start;
  //         delete mergedAccountData.date_start;
  //         const accountInsight = await this.insightRepository.create(
  //           mergedAccountData
  //         );
  //         await this.insightRepository.save(accountInsight);
  //       }

  //       // Process each campaign
  //       for (const campaign of campaigns) {
  //         let mergedCampaignData: any = {};
  //         for (const fieldChunk of fieldChunks) {
  //           await delay(1000); // Rate limiting delay between chunks
  //           const campaignChunkData = await fetchInsightsWithRetry(
  //             `/campaign/${campaign.id}/insights`,
  //             dateRange,
  //             fieldChunk
  //           );
  //           if (campaignChunkData && campaignChunkData[0]) {
  //             mergedCampaignData = mergeInsights(
  //               mergedCampaignData,
  //               campaignChunkData[0]
  //             );
  //           }
  //         }
  //         if (Object.keys(mergedCampaignData).length > 0) {
  //           mergedCampaignData.reference_type = 'campaign';
  //           mergedCampaignData.referenceId = campaign.id;
  //           mergedCampaignData.date = mergedCampaignData.date_start;
  //           delete mergedCampaignData.date_start;
  //           const campaignInsight = await this.insightRepository.create(
  //             mergedCampaignData
  //           );
  //           await this.insightRepository.save(campaignInsight);
  //         }

  //         // Fetch ad sets for the campaign
  //         const adSets = await this.adSetRepository.find({
  //           where: { campaign: campaign }
  //         });

  //         // Process each ad set
  //         for (const adSet of adSets) {
  //           let mergedAdSetData: any = {};
  //           for (const fieldChunk of fieldChunks) {
  //             await delay(1000); // Rate limiting delay between chunks
  //             const adSetChunkData = await fetchInsightsWithRetry(
  //               `/adset/${adSet.id}/insights`,
  //               dateRange,
  //               fieldChunk
  //             );
  //             if (adSetChunkData && adSetChunkData[0]) {
  //               mergedAdSetData = mergeInsights(
  //                 mergedAdSetData,
  //                 adSetChunkData[0]
  //               );
  //             }
  //           }
  //           if (Object.keys(mergedAdSetData).length > 0) {
  //             mergedAdSetData.reference_type = 'ad_set';
  //             mergedAdSetData.referenceId = adSet.id;
  //             mergedAdSetData.date = mergedAdSetData.date_start;
  //             delete mergedAdSetData.date_start;
  //             const adSetInsight = await this.insightRepository.create(
  //               mergedAdSetData
  //             );
  //             await this.insightRepository.save(adSetInsight);
  //           }

  //           // Fetch ads for the ad set
  //           const ads = await this.adRepository.find({
  //             where: { adset: adSet.id }
  //           });

  //           // Process each ad
  //           for (const ad of ads) {
  //             let mergedAdData: any = {};
  //             for (const fieldChunk of fieldChunks) {
  //               await delay(1000); // Rate limiting delay between chunks
  //               const adChunkData = await fetchInsightsWithRetry(
  //                 `/ad/${ad.id}/insights`,
  //                 dateRange,
  //                 fieldChunk
  //               );
  //               if (adChunkData && adChunkData[0]) {
  //                 mergedAdData = mergeInsights(mergedAdData, adChunkData[0]);
  //               }
  //             }
  //             if (Object.keys(mergedAdData).length > 0) {
  //               mergedAdData.reference_type = 'ad';
  //               mergedAdData.referenceId = ad.id;
  //               mergedAdData.date = mergedAdData.date_start;
  //               delete mergedAdData.date_start;
  //               const adInsight = await this.insightRepository.create(
  //                 mergedAdData
  //               );
  //               await this.insightRepository.save(adInsight);
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error, '<<<<');
  //       throw new HttpException(error, 500);
  //       console.error(
  //         `Error processing insights for account ${account.account_id}:`,
  //         error
  //       );
  //       console.warn(`Skipping account ${account.account_id} due to error`);
  //     }
  //   }

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'Insights processed successfully'
  //   };
  // }

  async fetchInsightsWithRetry(path, dateRange, fieldChunk) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const fb = await this.initializeFB();

        const response: any = await new Promise((resolve, reject) => {
          fb.api(
            path,
            'GET',
            {
              fields: fieldChunk.join(','),
              date_preset: 'today',
              // time_range: { since: '2023-12-04', until: '2023-12-05' },
              limit: 100
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
        console.log(error);

        attempts++;
        if (error.code === 2 && error.error_subcode === 1504018) {
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

  // Helper function to fetch insights for an entity
  async fetchInsightsForEntity(path, dateRange, fieldChunks) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let mergedData = {};

    for (const fieldChunk of fieldChunks) {
      await delay(1000); // Rate limiting delay between chunks
      const chunkData = await this.fetchInsightsWithRetry(
        path,
        dateRange,
        fieldChunk
      );

      if (chunkData && chunkData[0]) {
        mergedData = {
          ...mergedData,
          ...chunkData[0]
        };
      } else {
        return null;
      }
    }
    return mergedData;
  }

  // Helper function to save insights to the database
  async saveInsights(insightData, referenceType, referenceId) {
    if (Object.keys(insightData).length > 0) {
      insightData.reference_type = referenceType;
      insightData.referenceId = referenceId;
      insightData.date = insightData.date_start;
      delete insightData.date_start;

      const insight = await this.insightRepository.create(insightData);
      await this.insightRepository.save(insight);
    }
  }

  // Process insights for AdAccount
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
    await this.saveInsights(
      insights,
      'ad_account',
      `act_${account.account_id}`
    );
  }

  // Process insights for Campaign
  async processCampaignInsights(campaign, dateRange, fieldChunks) {
    const path = `/${campaign.campaign_meta_id}/insights`;
    const insights = await this.fetchInsightsForEntity(
      path,
      dateRange,
      fieldChunks
    );
    if (insights === null) {
      return null;
    }
    await this.saveInsights(insights, 'campaign', campaign.id);
  }

  // Process insights for AdSet
  async processAdSetInsights(adSet, dateRange, fieldChunks) {
    const path = `/${adSet.adset_meta_id}/insights`;
    const insights = await this.fetchInsightsForEntity(
      path,
      dateRange,
      fieldChunks
    );
    if (insights === null) {
      return null;
    }
    await this.saveInsights(insights, 'ad_set', adSet.id);
  }

  // Process insights for Ad
  async processAdInsights(ad, dateRange, fieldChunks) {
    const path = `${ad.ad_meta_id}/insights`;
    const insights = await this.fetchInsightsForEntity(
      path,
      dateRange,
      fieldChunks
    );
    if (insights === null) {
      return null;
    }
    await this.saveInsights(insights, 'ad', ad.id);
  }

  // Main function
  async getInsights() {
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
    const fieldChunks = [
      // Core metrics chunk
      [
        'reach',
        'impressions',
        'clicks',
        'spend',
        'ctr',
        'cpc',
        'cpm',
        'date_start',
        'date_stop'
      ],
      // Video metrics chunk
      [
        'video_30_sec_watched_actions',
        'video_avg_time_watched_actions',
        'video_play_actions'
      ],
      // Cost metrics chunk
      [
        'cost_per_outbound_click',
        'cost_per_thruplay',
        'cost_per_unique_action_type'
      ],
      // Engagement metrics chunk
      [
        'engagement_rate_ranking',
        'estimated_ad_recall_rate',
        'inline_link_click_ctr'
      ],
      // Additional metrics chunk
      ['website_ctr', 'purchase_roas', 'quality_ranking']
    ];
    const today = new Date();
    const dateRange = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    for (const account of accountData) {
      try {
        const adAccountData = await this.processAdAccountInsights(
          account,
          dateRange,
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
            dateRange,
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
              dateRange,
              fieldChunks
            );
            if (adSetData === null) {
              continue;
            }
            const ads = await this.adRepository.find({
              where: { adset_id: adSet.adset_meta_id }
            });
            for (const ad of ads) {
              await this.processAdInsights(ad, dateRange, fieldChunks);
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

  async getDateRangeForToday() {}
}
