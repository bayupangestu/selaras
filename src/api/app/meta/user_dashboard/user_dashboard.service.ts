import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';
import { Campaign } from '@/entity/campaign.entity';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectRepository(UserDashboard)
    private readonly userDashboardRepository: Repository<UserDashboard>,

    @InjectRepository(DashboardAttributeVisibility)
    private readonly dashboardAttributeRepository: Repository<DashboardAttributeVisibility>,

    @InjectRepository(UserCampaign)
    private readonly userCampaignRepository: Repository<UserCampaign>,

    @InjectRepository(UserAdsets)
    private readonly userAdsetRepository: Repository<UserAdsets>,

    @InjectRepository(UserAd)
    private readonly userAdRepository: Repository<UserAd>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    @InjectRepository(AdSet)
    private readonly adsetRepository: Repository<AdSet>,

    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>
  ) {}

  async campaignUserDashboard(query: any) {
    const budgetData = await this.userCampaignRepository.find({
      select: {
        user_adsets: {
          budget: true
        }
      },
      relations: {
        user_adsets: true
      },
      where: {
        id: query.user_campaign_id
      }
    });

    // Hitung total budget dari semua kampanye
    const budget = budgetData.reduce((totalBudget, campaign) => {
      const campaignBudget =
        campaign.user_adsets?.reduce(
          (sum, adset) => sum + (adset.budget || 0),
          0
        ) || 0;
      return totalBudget + campaignBudget;
    }, 0);

    return this.getDashboardData(
      query,
      'user_campaign_id',
      this.userCampaignRepository,
      budget
    );
  }

  async adSetDashboard(query: any) {
    const budget = await this.userAdsetRepository.findOne({
      select: ['budget'],
      where: {
        id: query.user_adset_id
      }
    });

    return this.getDashboardData(
      query,
      'user_adset_id',
      this.userAdsetRepository,
      budget
    );
  }

  async adDashboard(query: any) {
    const budgetData = await this.userAdRepository.findOne({
      select: {
        user_adset_id: {
          budget: true
        }
      },
      relations: {
        user_adset_id: true
      },
      where: {
        id: query.user_ad_id
      }
    });
    if (!budgetData) {
      throw new HttpException('not found', 404);
    }

    return this.getDashboardData(
      query,
      'user_ad_id',
      this.userAdRepository,
      budgetData.user_adset_id.budget
    );
  }

  private async getDashboardData(
    query: any,
    idField: string,
    repository: any,
    budget: any
  ) {
    if (!query[idField]) {
      throw new HttpException(
        `${idField.replace('_', ' ')} must be provided.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const entityData = await repository.findOne({
      where: { id: query[idField] }
    });
    if (!entityData) {
      throw new HttpException(`${idField.replace('_id', '')} not found`, 404);
    }

    const userDashboard = await this.userDashboardRepository.find({
      relations: {
        dashboard_attribute_visibility_id: true,
        campaign_type_id: true
      },
      where: { [idField]: { id: entityData.id } }
    });

    if (!userDashboard || userDashboard.length === 0) {
      throw new HttpException(
        `${idField.replace('_id', '')} dashboard not found`,
        404
      );
    }

    let startDateFilter = query.start_date
      ? new Date(`${query.start_date}T00:00:00.000Z`)
      : null;
    let endDateFilter = query.end_date
      ? new Date(`${query.end_date}T23:59:59.999Z`)
      : null;

    const filteredDashboard = userDashboard.filter((item) => {
      const timePeriodDate = new Date(item.time_period);
      return (
        (!startDateFilter || timePeriodDate >= startDateFilter) &&
        (!endDateFilter || timePeriodDate <= endDateFilter)
      );
    });

    if (filteredDashboard.length === 0) {
      return {
        [idField]: entityData.id,
        name: entityData.name,
        start_date: null,
        end_date: null,
        data_card: {},
        metrics: []
      };
    }

    const allowedAttributes = new Set(
      filteredDashboard[0].dashboard_attribute_visibility_id.attribute_name
    );

    const result: any = {
      [idField]: entityData.id,
      name: entityData.name,
      start_date: null,
      end_date: null
    };

    const aggregatedData: any = {};
    const metrics: any[] = [];
    let startDate = null;
    let endDate = null;
    let costPerResult: any;

    filteredDashboard.forEach((item) => {
      const timePeriod = item.time_period;
      if (!startDate || new Date(timePeriod) < new Date(startDate)) {
        startDate = timePeriod;
      }
      if (!endDate || new Date(timePeriod) > new Date(endDate)) {
        endDate = timePeriod;
      }

      const campaignType = item.campaign_type_id?.name || 'Unknown';

      // Determine the metric based on campaign type
      const metricKey = (() => {
        switch (campaignType.toLowerCase()) {
          case 'cpm':
            costPerResult = item.cost_per_mile;
            return 'reach';
          case 'cpc':
            costPerResult = item.cost_per_click;
            return 'link_click';
          case 'cpl':
            costPerResult = item.cost_per_lead;
            return 'lead';
          case 'cpe':
            costPerResult = item.cost_per_engagement;
            return 'post_engagement';
          case 'cpv':
            costPerResult = item.cost_per_view;
            return 'video_views';
          default:
            return null;
        }
      })();

      if (metricKey) {
        const existingMetric = metrics.find((m) => m.date === timePeriod);
        if (existingMetric) {
          existingMetric[metricKey] =
            (existingMetric[metricKey] || 0) + (item[metricKey] || 0);
        } else {
          metrics.push({
            date: timePeriod,
            [metricKey]: item[metricKey] || 0
          });
        }
      }

      Object.keys(item).forEach((key) => {
        if (allowedAttributes.has(key)) {
          if (typeof item[key] === 'number') {
            aggregatedData[key] = (aggregatedData[key] || 0) + item[key];
          } else {
            aggregatedData[key] = item[key];
          }
        }
      });
    });

    delete aggregatedData.time_period;
    result.start_date = startDate;
    result.end_date = endDate;

    const resultValue = costPerResult + costPerResult * budget;

    const amountSpend = costPerResult * resultValue;

    // const formattedAmountSpend = new Intl.NumberFormat('id-ID', {
    //   style: 'currency',
    //   currency: 'IDR'
    // }).format(amountSpend);

    const data_card = {
      ...aggregatedData,
      amount_spend: amountSpend
    };

    return { ...result, data_card, metrics };
  }

  async getCampaign(query, user) {
    let option: any = {
      relations: {
        user_project_id: {
          user_id: true
        }
      },
      select: ['id', 'name'],
      where: {
        user_project_id: {
          user_id: {
            id: user.id
          }
        }
      }
    };
    if (query.search) {
      option['where'] = option['where'] || {};
      option['where']['name'] = ILike(`%${query.search}%`);
    }

    const result = await this.userCampaignRepository.find(option);
    return {
      statusCode: 200,
      data: result
    };
  }

  async getAdSets(query: any) {
    let option: any = {
      relations: {
        user_campaign_id: true
      },
      select: ['id', 'name'],
      where: {
        user_campaign_id: {
          id: query.user_campaign_id
        }
      }
    };

    if (query.search) {
      option['where'] = option['where'] || {};
      option['where']['name'] = ILike(`%${query.search}%`);
    }

    const result = await this.userAdsetRepository.find(option);

    return {
      statusCode: 200,
      data: result
    };
  }

  async getAds(query: any) {
    let option: any = {
      relations: {
        user_adset_id: true
      },
      select: ['id', 'name'],
      where: {
        user_adset_id: {
          id: query.user_adset_id
        }
      }
    };

    if (query.search) {
      option['where'] = option['where'] || {};
      option['where']['name'] = ILike(`%${query.search}%`);
    }

    const result = await this.userAdRepository.find(option);

    return {
      statusCode: 200,
      data: result
    };
  }
}
