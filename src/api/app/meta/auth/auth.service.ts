import { Setting } from '@/migrations/setting.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { META_CONFIG } from '@/constants/meta';

@Injectable()
export class AuthService {
  @InjectRepository(Setting)
  private readonly settingRepository: Repository<Setting>;

  async getLongLivedToken(shortLivedToken: string): Promise<string> {
    try {
      const url = `${META_CONFIG.BASE_URL}/oauth/access_token`;
      console.log(META_CONFIG.APP_ID, META_CONFIG.APP_SECRET);

      const response = await axios.get(url, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: META_CONFIG.APP_ID,
          client_secret: META_CONFIG.APP_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });

      const longLivedToken = response.data;

      const newSetting = new Setting();
      newSetting.key = 'access_token';
      newSetting.value = response.data.access_token;
      await this.settingRepository.save(newSetting);

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
      where: { key: 'access_token' }
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
    const url = `${META_CONFIG.BASE_URL}/v21.0/me/adaccounts?fields=name`;
    try {
      const accessToken = await this.getToken();
      const response = await axios.get(url, {
        params: {
          access_token: accessToken
        }
      });
      return response.data.data; // Daftar akun iklan
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
