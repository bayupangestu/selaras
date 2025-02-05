import { Setting } from '@/entity/setting.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { MetaConfig } from '@/constants/meta';
import { FB } from 'fb';
import { SettingService } from '@/api/cms/setting/setting.service';

@Injectable()
export class AuthService {
  private fb: FB;
  constructor(
    private readonly settingService: SettingService,

    private readonly metaConfig: MetaConfig,

    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>
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

  async getLongLivedToken(shortLivedToken: string): Promise<string> {
    try {
      const url = `${this.metaConfig.META_BASE_URL}/oauth/access_token`;

      const response = await axios.get(url, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.metaConfig.META_APP_ID,
          client_secret: this.metaConfig.META_APP_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });

      const longLivedToken = response.data;
      const checkToken = await this.settingRepository.findOne({
        where: {
          key: 'ACCESS_TOKEN'
        }
      });
      if (!checkToken) {
        const newSetting = new Setting();
        newSetting.key = 'ACCESS_TOKEN';
        newSetting.value = response.data.access_token;
        await this.settingRepository.save(newSetting);
      } else {
        checkToken.value = response.data.access_token;
        await this.settingRepository.save(checkToken);
      }
      return longLivedToken;
    } catch (error) {
      console.error(
        'Error fetching Long-Lived Access Token:',
        error.response?.data || error.message
      );
      throw new HttpException(
        'Failed to fetch Long-Lived Access Token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getToken(): Promise<String> {
    const result = await this.settingRepository.findOne({
      where: { key: 'ACCESS_TOKEN' }
    });
    if (!result || !result.value) {
      throw new HttpException(
        'Access Token not found in the database',
        HttpStatus.NOT_FOUND
      );
    }

    return result.value;
  }

  async getAdAccounts(): Promise<any> {
    // const url = `${META_CONFIG.BASE_URL}/v21.0/me/adaccounts?fields=name`;
    const url = `${this.metaConfig.META_BASE_URL}/v21.0/me/adaccounts?fields=name`;
    try {
      const fb = await this.initializeFB();
      const accessToken = await this.getToken();
      // const response = await axios.get(url, {
      //   params: {
      //     access_token: accessToken
      //   }
      // });
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
      // return response.data.data; // Daftar akun iklan
      return result;
    } catch (error) {
      console.error(
        'Error fetching Ad Accounts:',
        error.response?.data || error.message
      );
      throw new HttpException(
        'Failed to fetch Ad Accounts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
