import { HttpException, Injectable } from '@nestjs/common';
import { GoogleAdsApi } from 'google-ads-api';

@Injectable()
export class CampaignService {
  private client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN
  });

  async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.client.Customer({
        customer_id: customerId.replace(/-/g, ''), // Google Ads ID kadang perlu tanpa strip
        refresh_token: refreshToken
      });
      console.log(customer);

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.average_cpv,
          metrics.view_rate,
          metrics.video_view_rate,
          metrics.video_quartile_100_rate,
          metrics.engagements
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        LIMIT 50
      `;

      const result = await customer.query(query);
      return result;
    } catch (err) {
      console.error('❌ Google Ads Error:', err);
      throw new HttpException('Failed to fetch campaigns', 500);
    }
  }
}
