import { Injectable } from '@nestjs/common';
const axios = require('axios');

@Injectable()
export class AdsManagerService {
  public async getCampaigns() {
    const url = `https://graph.facebook.com/v21.0/${process.env.ACT_ID}/campaigns`;
    const params = {
      fields: 'id,name',
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const campaigns = response.data?.data;

      if (!campaigns) {
        throw new Error('No campaigns found');
      }

      // Return campaign ID and Name
      return campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name
      }));
    } catch (error) {
      console.error('Error fetching campaigns:', error.message);
      throw error;
    }
  }

  public async getAdSets(campaignId: string) {
    const url = `https://graph.facebook.com/v21.0/${campaignId}/adsets`;
    const params = {
      fields: 'id,name',
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const adSets = response.data?.data;

      if (!adSets) {
        throw new Error('No ad sets found');
      }

      // Return ad set ID and Name
      return adSets.map((adSet) => ({
        id: adSet.id,
        name: adSet.name
      }));
    } catch (error) {
      console.error('Error fetching ad sets:', error.message);
      throw error;
    }
  }

  public async getAds(adSetId: string) {
    const url = `https://graph.facebook.com/v21.0/${adSetId}/ads`;
    const params = {
      fields: 'id,name',
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const ads = response.data?.data;

      if (!ads) {
        throw new Error('No ads found');
      }

      // Return ad ID and Name
      return ads.map((ad) => ({
        id: ad.id,
        name: ad.name
      }));
    } catch (error) {
      console.error('Error fetching ads:', error.message);
      throw error;
    }
  }
}
