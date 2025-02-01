import { Injectable } from '@nestjs/common';
const axios = require('axios');

@Injectable()
export class AdsService {
  public async cpm() {
    const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;
    const params = {
      fields: 'reach,impressions,ctr,engagement_rate_ranking,spend,actions,cpc',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Mengambil data pertama

      if (!data) {
        throw new Error('No data found in the API response');
      }

      // Ambil data yang diperlukan
      const reach = parseInt(data.reach, 10);
      const impressions = parseInt(data.impressions, 10);
      const ctr = parseFloat(data.ctr); // Sudah dalam format persen (0.3%).
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];

      // Total Post Engagement (ambil value dari action_type "post_engagement")
      const postEngagement =
        actions.find((action) => action.action_type === 'post_engagement')
          ?.value || 0;

      // Total Results (ambil value dari action_type "link_click")
      const totalResults =
        actions.find((action) => action.action_type === 'link_click')?.value ||
        0;

      // Hitung Post Engagement Rate
      const postEngagementRate =
        impressions > 0 ? (postEngagement / impressions) * 100 : 0;

      // Hitung Cost Per Result
      const costPerResult = totalResults > 0 ? spend / totalResults : 0;

      // Return hasil dalam format yang diinginkan
      return {
        reach,
        impressions,
        ctr,
        postEngagementRate: parseFloat(postEngagementRate.toFixed(2)), // Dibulatkan ke 2 desimal
        costPerResult: parseFloat(costPerResult.toFixed(2)) // Dibulatkan ke 2 desimal
      };
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error;
    }
  }

  public async cpe() {
    const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;
    const params = {
      fields: 'reach,impressions,ctr,frequency,spend,actions',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Ambil data pertama

      if (!data) {
        throw new Error('No data found in the API response');
      }

      // Ambil data yang diperlukan
      const reach = parseInt(data.reach, 10);
      const impressions = parseInt(data.impressions, 10);
      const ctr = parseFloat(data.ctr);
      const frequency = parseFloat(data.frequency);
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];

      // Total Engagement (ambil semua tindakan engagement yang relevan)
      const totalEngagement = actions.reduce((total, action) => {
        if (
          ['post_engagement', 'like', 'comment', 'share', 'reaction'].includes(
            action.action_type
          )
        ) {
          return total + parseInt(action.value, 10);
        }
        return total;
      }, 0);

      // Hitung Cost Per Engagement
      const costPerEngagement =
        totalEngagement > 0 ? spend / totalEngagement : 0;

      // Hitung Engagement Rate
      const engagementRate =
        impressions > 0 ? (totalEngagement / impressions) * 100 : 0;

      // Return data dalam format yang diinginkan
      return {
        costPerEngagement: parseFloat(costPerEngagement.toFixed(2)),
        totalEngagement,
        impressions,
        ctr: parseFloat(ctr.toFixed(2)),
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        reach,
        frequency: parseFloat(frequency.toFixed(2)),
        spend
      };
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error.message;
    }
  }

  public async cpv() {
    const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;
    const params = {
      fields:
        'impressions,spend,video_30_sec_watched_actions,video_avg_time_watched_actions,video_p100_watched_actions,video_play_actions,actions,canvas_avg_view_time,video_play_retention_0_to_15s_actions',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Ambil data pertama
      return data;

      if (!data) {
        throw new Error('No data found in the API response');
      }

      // Ambil data yang diperlukan

      const impressions = parseInt(data.impressions, 10);
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];
      const videoPlayAction = data.video_play_actions[0].value;
      const videoAvgSecWatched = parseFloat(
        data.video_avg_time_watched_actions || 0
      );

      //   // Video Views
      //   const videoViews =
      //     actions.find((action) => action.action_type === 'video_view')?.value ||
      //     0;

      //   // Thruplays
      //   const thruplays =
      //     actions.find((action) => action.action_type === 'thruplay')?.value || 0;

      // Total Engagement (like, comment, share, reaction, etc.)
      const totalEngagement = actions.reduce((total, action) => {
        if (
          ['post_engagement', 'like', 'comment', 'share', 'reaction'].includes(
            action.action_type
          )
        ) {
          return total + parseInt(action.value, 10);
        }
        return total;
      }, 0);

      // Hitung Cost Per View
      //   const costPerView = videoViews > 0 ? spend / videoViews : 0;
      const costPerView = videoPlayAction > 0 ? spend / videoPlayAction : 0;

      // Hitung Video Completion Rate
      //   const videoCompletionRate =
      //     videoViews > 0 ? (thruplays / videoViews) * 100 : 0;

      //   Hitung Engagement Rate
      const engagementRate =
        impressions > 0 ? (totalEngagement / impressions) * 100 : 0;

      // Return data dalam format yang diinginkan
      return {
        costPerView: parseFloat(costPerView.toFixed(2)),
        videoViews: videoPlayAction,
        thruplays: videoPlayAction,
        videoCompletionRate: data.video_p100_watched_actions[0].value,
        averagePlayTime: parseFloat(videoAvgSecWatched.toFixed(2)),
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        spend
      };
    } catch (error) {
      console.error(
        'Error fetching video insights from Meta API:',
        error.message
      );
      throw error.message;
    }
  }

  public async cpc() {
    const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;
    const params = {
      fields: 'clicks,actions,ctr,spend,cpc',
      time_range: { since: '2024-01-01', until: '2025-01-21' }, // Ganti dengan rentang waktu Anda
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const insights = response.data.data;

      if (!insights || insights.length === 0) {
        return [];
      }

      // Olah data untuk hasil yang diinginkan
      return insights.map((item) => {
        const clicks = parseInt(item.clicks, 10) || 0;
        const ctr = parseFloat(item.ctr) || 0;
        const spend = parseFloat(item.spend) || 0;
        const cpc = parseFloat(item.cpc) || (clicks > 0 ? spend / clicks : 0);

        // Ambil actions untuk link_clicks dan landing_page_views
        const actions = item.actions || [];
        const linkClicks = parseInt(
          actions.find((action) => action.action_type === 'link_click')
            ?.value || 0,
          10
        );
        const landingPageViews = parseInt(
          actions.find((action) => action.action_type === 'landing_page_view')
            ?.value || 0,
          10
        );

        return {
          clicks,
          linkClicks,
          ctr,
          landingPageViews,
          cpc: parseFloat(cpc.toFixed(2)) // Bulatkan ke 2 desimal
        };
      });
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error;
    }
  }

  public async getDailyMetrics() {
    const startDate = '2024-09-01';
    const endDate = '2024-10-31';
    const dailyData: any[] = [];

    // Ambil data untuk setiap hari dalam rentang waktu
    for (
      let date = new Date(startDate);
      date <= new Date(endDate);
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;
      const params = {
        fields:
          'reach,impressions,ctr,engagement_rate_ranking,spend,actions,cpc',
        time_range: { since: dateString, until: dateString },
        access_token: process.env.ACCESS_TOKEN
      };

      try {
        const response = await axios.get(url, { params });
        const data = response.data?.data[0];

        if (data) {
          const reach = parseInt(data.reach, 10);
          const impressions = parseInt(data.impressions, 10);
          const ctr = parseFloat(data.ctr);
          const spend = parseFloat(data.spend);
          const actions = data.actions || [];

          const postEngagement =
            actions.find((action) => action.action_type === 'post_engagement')
              ?.value || 0;
          const totalResults =
            actions.find((action) => action.action_type === 'link_click')
              ?.value || 0;

          const postEngagementRate =
            impressions > 0 ? (postEngagement / impressions) * 100 : 0;
          const costPerResult = totalResults > 0 ? spend / totalResults : 0;

          dailyData.push({
            date: dateString,
            reach,
            impressions,
            ctr,
            postEngagementRate: parseFloat(postEngagementRate.toFixed(2)),
            costPerResult: parseFloat(costPerResult.toFixed(2))
          });
        }
      } catch (error) {
        console.error(
          'Error fetching daily data from Meta API:',
          error.message
        );
      }
    }

    return dailyData;
  }

  public async getCampaignSummary(campaignId: string) {
    const campaignDetailsUrl = `${process.env.META_BASE_URL}/${campaignId}`;
    const campaignDetailsParams = {
      fields: 'name',
      access_token: process.env.ACCESS_TOKEN
    };

    const campaignDetailsResponse = await axios.get(campaignDetailsUrl, {
      params: campaignDetailsParams
    });

    const campaignName = campaignDetailsResponse.data?.name;

    if (!campaignName) {
      throw new Error('Campaign name not found');
    }

    const url = `${process.env.META_BASE_URL}/${campaignId}/insights`;
    const params = {
      fields: 'reach,impressions,ctr,engagement_rate_ranking,spend,actions,cpc',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Ambil data pertama

      if (!data) {
        throw new Error('No data found in the API response');
      }

      // Ambil data yang diperlukan
      const reach = parseInt(data.reach, 10);
      const impressions = parseInt(data.impressions, 10);
      const ctr = parseFloat(data.ctr);
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];

      const postEngagement =
        actions.find((action) => action.action_type === 'post_engagement')
          ?.value || 0;
      const totalResults =
        actions.find((action) => action.action_type === 'link_click')?.value ||
        0;

      const postEngagementRate =
        impressions > 0 ? (postEngagement / impressions) * 100 : 0;
      const costPerResult = totalResults > 0 ? spend / totalResults : 0;

      return {
        reach,
        impressions,
        ctr,
        postEngagementRate: parseFloat(postEngagementRate.toFixed(2)),
        costPerResult: parseFloat(costPerResult.toFixed(2)),
        spend,
        name: campaignName
      };
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error.message;
    }
  }

  public async getAdSetSummary(adSetId: string) {
    const adSetUrl = `${process.env.META_BASE_URL}/${adSetId}`;
    const adSetParams = {
      fields: 'name',
      access_token: process.env.ACCESS_TOKEN
    };

    const adSetResponse = await axios.get(adSetUrl, {
      params: adSetParams
    });

    const adSetName = adSetResponse.data?.name;

    if (!adSetName) {
      throw new Error('Campaign name not found');
    }

    const url = `${process.env.META_BASE_URL}/${adSetId}/insights`;
    const params = {
      fields: 'reach,impressions,ctr,engagement_rate_ranking,spend,actions,cpc',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Ambil data pertama

      if (!data) {
        throw new Error('No data found in the API response');
      }

      const reach = parseInt(data.reach, 10);
      const impressions = parseInt(data.impressions, 10);
      const ctr = parseFloat(data.ctr);
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];

      const postEngagement =
        actions.find((action) => action.action_type === 'post_engagement')
          ?.value || 0;
      const totalResults =
        actions.find((action) => action.action_type === 'link_click')?.value ||
        0;

      const postEngagementRate =
        impressions > 0 ? (postEngagement / impressions) * 100 : 0;
      const costPerResult = totalResults > 0 ? spend / totalResults : 0;

      return {
        reach,
        impressions,
        ctr,
        postEngagementRate: parseFloat(postEngagementRate.toFixed(2)),
        costPerResult: parseFloat(costPerResult.toFixed(2)),
        spend,
        name: adSetName
      };
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error;
    }
  }

  public async getAdSummary(adId: string) {
    const adUrl = `${process.env.META_BASE_URL}/${adId}`;
    const adParams = {
      fields: 'name',
      access_token: process.env.ACCESS_TOKEN
    };

    const adResponse = await axios.get(adUrl, {
      params: adParams
    });

    const adName = adResponse.data?.name;

    if (!adName) {
      throw new Error('Campaign name not found');
    }

    const url = `${process.env.META_BASE_URL}/${adId}/insights`;
    const params = {
      fields: 'reach,impressions,ctr,engagement_rate_ranking,spend,actions,cpc',
      time_range: { since: '2024-04-01', until: '2024-06-30' },
      access_token: process.env.ACCESS_TOKEN
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data?.data[0]; // Ambil data pertama

      if (!data) {
        throw new Error('No data found in the API response');
      }

      const reach = parseInt(data.reach, 10);
      const impressions = parseInt(data.impressions, 10);
      const ctr = parseFloat(data.ctr);
      const spend = parseFloat(data.spend);
      const actions = data.actions || [];

      const postEngagement =
        actions.find((action) => action.action_type === 'post_engagement')
          ?.value || 0;
      const totalResults =
        actions.find((action) => action.action_type === 'link_click')?.value ||
        0;

      const postEngagementRate =
        impressions > 0 ? (postEngagement / impressions) * 100 : 0;
      const costPerResult = totalResults > 0 ? spend / totalResults : 0;

      return {
        reach,
        impressions,
        ctr,
        postEngagementRate: parseFloat(postEngagementRate.toFixed(2)),
        costPerResult: parseFloat(costPerResult.toFixed(2)),
        spend,
        name: adName
      };
    } catch (error) {
      console.error('Error fetching data from Meta API:', error.message);
      throw error;
    }
  }
}
