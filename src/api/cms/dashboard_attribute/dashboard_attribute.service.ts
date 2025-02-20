import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, getMetadataArgsStorage } from 'typeorm';

@Injectable()
export class DashboardAttributeService {
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
    private readonly userAdRepository: Repository<UserAd>
  ) {}

  getEntityColumns(entity: any) {
    const metadataArgsStorage = getMetadataArgsStorage();

    // Ambil semua kolom dari entitas yang diberikan
    const columns = metadataArgsStorage.columns
      .filter((column) => column.target === entity)
      .filter(
        (column) =>
          !['created_at', 'updated_at', 'deleted_at', 'id'].includes(
            column.propertyName
          )
      )
      .map((column) => column.options.name || column.propertyName);

    // Ambil semua hubungan (relasi) dari entitas tersebut
    const relations = metadataArgsStorage.relations
      .filter((relation) => relation.target === entity)
      .map((relation) => relation.propertyName);

    // Ambil semua kolom foreign key dari relasi
    const foreignKeyColumns = metadataArgsStorage.relations
      .filter((relation) => relation.target === entity)
      .flatMap((relation) => {
        const relationMetadata = metadataArgsStorage.relations.find(
          (rel) =>
            rel.target === entity && rel.propertyName === relation.propertyName
        );
        if (!relationMetadata) return [];
        return [];
      });

    // Gabungkan kolom dan hubungan, lalu hapus duplikat
    const allColumns = [...columns, ...relations];

    // Filter out kolom foreign key dan kolom yang sudah ada di kolom asli
    const filteredColumns = allColumns.filter((column) => {
      return !foreignKeyColumns.includes(column) && !relations.includes(column);
    });

    return Array.from(new Set(filteredColumns));
  }

  async getAttribute() {
    const columns = this.getEntityColumns(UserDashboard);
    return {
      statusCode: 200,
      data: columns
    };
  }

  async customDashboard(body: any) {
    const userCampaignData = await this.userCampaignRepository.findOne({
      relations: {
        user_adsets: {
          meta_adset_id: true,
          user_ads: {
            meta_ad_id: true
          }
        },
        meta_campaign_id: true,
        user_id: true,
        user_project_id: true,
        campaign_type_id: true,
        platform_id: true
      },
      where: {
        id: body.user_campaign_id
      }
    });

    const queryRunner =
      this.dashboardAttributeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newDashboardVisibility = new DashboardAttributeVisibility();
      newDashboardVisibility.attribute_name = body.name;
      newDashboardVisibility.is_visible = true;
      newDashboardVisibility.user_campaign_id = userCampaignData;

      const resultDashboardVisibility = await queryRunner.manager.save(
        newDashboardVisibility
      );

      const newCampaignDashboard = new UserDashboard();
      newCampaignDashboard.campaign_type_id = userCampaignData.campaign_type_id;
      newCampaignDashboard.user_id = userCampaignData.user_id;
      newCampaignDashboard.user_campaign_id = userCampaignData;
      newCampaignDashboard.meta_campaign_id = userCampaignData.meta_campaign_id;
      newCampaignDashboard.dashboard_attribute_visibility_id =
        resultDashboardVisibility;

      await queryRunner.manager.save(newCampaignDashboard);

      const adsetDashboards = [];
      const adDashboards = [];

      for (const userAdset of userCampaignData.user_adsets) {
        const newAdsetDashboard = new UserDashboard();
        newAdsetDashboard.campaign_type_id = userCampaignData.campaign_type_id;
        newAdsetDashboard.user_id = userCampaignData.user_id;
        newAdsetDashboard.user_adset_id = userAdset;
        newAdsetDashboard.meta_adset_id = userAdset.meta_adset_id;
        newAdsetDashboard.dashboard_attribute_visibility_id =
          resultDashboardVisibility;

        adsetDashboards.push(queryRunner.manager.save(newAdsetDashboard));

        for (const userAd of userAdset.user_ads) {
          const newAdDashboard = new UserDashboard();
          newAdDashboard.campaign_type_id = userCampaignData.campaign_type_id;
          newAdDashboard.user_id = userCampaignData.user_id;
          newAdDashboard.user_ad_id = userAd;
          newAdDashboard.meta_ad_id = userAd.meta_ad_id;
          newAdDashboard.dashboard_attribute_visibility_id =
            resultDashboardVisibility;

          adDashboards.push(queryRunner.manager.save(newAdDashboard));
        }
      }

      // Save all adsetDashboards and adDashboards in parallel
      await Promise.all([
        Promise.all(adsetDashboards),
        Promise.all(adDashboards)
      ]);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: 'Dashboard created!'
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, 400);
    } finally {
      await queryRunner.release();
    }
  }

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
    const budgetData = await this.userAdsetRepository.findOne({
      select: ['budget'],
      where: {
        id: query.user_adset_id
      }
    });

    return this.getDashboardData(
      query,
      'user_adset_id',
      this.userAdsetRepository,
      budgetData.budget
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
    return this.getDashboardData(
      query,
      'user_ad_id',
      this.userAdRepository,
      budgetData.user_adset_id.budget
    );
  }

  // private async getDashboardData(
  //   query: any,
  //   idField: string,
  //   repository: any,
  //   budget: any
  // ) {
  //   if (!query[idField]) {
  //     throw new HttpException(
  //       `${idField.replace('_', ' ')} must be provided.`,
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   const entityData = await repository.findOne({
  //     where: { id: query[idField] }
  //   });
  //   if (!entityData) {
  //     throw new HttpException(`${idField.replace('_id', '')} not found`, 404);
  //   }

  //   const userDashboard = await this.userDashboardRepository.find({
  //     relations: {
  //       dashboard_attribute_visibility_id: true,
  //       campaign_type_id: true
  //     },
  //     where: { [idField]: { id: entityData.id } }
  //   });

  //   if (!userDashboard || userDashboard.length === 0) {
  //     throw new HttpException(
  //       `${idField.replace('_id', '')} dashboard not found`,
  //       404
  //     );
  //   }

  //   let startDateFilter = query.start_date
  //     ? new Date(`${query.start_date}T00:00:00.000Z`)
  //     : null;
  //   let endDateFilter = query.end_date
  //     ? new Date(`${query.end_date}T23:59:59.999Z`)
  //     : null;

  //   const filteredDashboard = userDashboard.filter((item) => {
  //     const timePeriodDate = new Date(item.time_period);
  //     return (
  //       (!startDateFilter || timePeriodDate >= startDateFilter) &&
  //       (!endDateFilter || timePeriodDate <= endDateFilter)
  //     );
  //   });

  //   if (filteredDashboard.length === 0) {
  //     return {
  //       [idField]: entityData.id,
  //       name: entityData.name,
  //       start_date: null,
  //       end_date: null,
  //       data_card: {},
  //       metrics: []
  //     };
  //   }

  //   const allowedAttributes = new Set(
  //     filteredDashboard[0].dashboard_attribute_visibility_id.attribute_name
  //   );

  //   const result: any = {
  //     [idField]: entityData.id,
  //     name: entityData.name,
  //     start_date: null,
  //     end_date: null
  //   };

  //   const aggregatedData: any = {};
  //   const metrics: any[] = [];
  //   let startDate = null;
  //   let endDate = null;
  //   let costPerResult: any;

  //   filteredDashboard.forEach((item) => {
  //     const timePeriod = item.time_period;
  //     if (!startDate || new Date(timePeriod) < new Date(startDate)) {
  //       startDate = timePeriod;
  //     }
  //     if (!endDate || new Date(timePeriod) > new Date(endDate)) {
  //       endDate = timePeriod;
  //     }

  //     const campaignType = item.campaign_type_id?.name || 'Unknown';

  //     // Determine the metric based on campaign type
  //     const metricKey = (() => {
  //       switch (campaignType.toLowerCase()) {
  //         case 'cpm':
  //           costPerResult = item.cost_per_mile;
  //           return 'reach';
  //         case 'cpc':
  //           costPerResult = item.cost_per_click;
  //           return 'link_click';
  //         case 'cpl':
  //           costPerResult = item.cost_per_lead;
  //           return 'lead';
  //         case 'cpe':
  //           costPerResult = item.cost_per_engagement;
  //           return 'post_engagement';
  //         case 'cpv':
  //           costPerResult = item.cost_per_view;
  //           return 'video_views';
  //         default:
  //           return null;
  //       }
  //     })();

  //     if (metricKey) {
  //       const existingMetric = metrics.find((m) => m.date === timePeriod);
  //       if (existingMetric) {
  //         existingMetric[metricKey] =
  //           (existingMetric[metricKey] || 0) + (item[metricKey] || 0);
  //       } else {
  //         metrics.push({
  //           date: timePeriod,
  //           [metricKey]: item[metricKey] || 0
  //         });
  //       }
  //     }

  //     Object.keys(item).forEach((key) => {
  //       if (allowedAttributes.has(key)) {
  //         if (typeof item[key] === 'number') {
  //           aggregatedData[key] = (aggregatedData[key] || 0) + item[key];
  //         } else {
  //           aggregatedData[key] = item[key];
  //         }
  //       }
  //     });
  //   });

  //   delete aggregatedData.time_period;
  //   result.start_date = startDate;
  //   result.end_date = endDate;

  //   // Calculate amount spend

  //   // Menambahkan console.log untuk debugging
  //   console.log('--- Debugging Calculation ---');
  //   console.log('Cost Per Result:', costPerResult);
  //   console.log('Budget:', budget);

  //   // Menghitung resultValue
  //   console.log('Calculating resultValue...');
  //   console.log(
  //     'Formula: resultValue = costPerResult + costPerResult * budget'
  //   );
  //   const resultValue = costPerResult + costPerResult * budget;
  //   console.log('resultValue:', resultValue);

  //   // Menghitung amountSpend
  //   console.log('Calculating amountSpend...');
  //   console.log('Formula: amountSpend = costPerResult * resultValue');
  //   const amountSpend = costPerResult * resultValue;
  //   console.log('amountSpend:', amountSpend);

  //   console.log('--- Final Results ---');
  //   console.log('resultValue:', resultValue);
  //   console.log('amountSpend:', amountSpend);

  //   const formattedAmountSpend = new Intl.NumberFormat('id-ID', {
  //     style: 'currency',
  //     currency: 'IDR'
  //   }).format(amountSpend);

  //   const data_card = {
  //     ...aggregatedData,
  //     amount_spend: formattedAmountSpend
  //   };

  //   return { ...result, data_card, metrics };
  // }

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
        metrics.push({
          date: timePeriod,
          name: metricKey,
          value: item[metricKey] || 0
        });
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

    const resultValue = costPerResult + costPerResult * aggregatedData.spend;

    const amountSpend =
      resultValue * metrics.reduce((sum, metric) => sum + metric.value, 0);

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

  async listCustomDashboard(query: any) {
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb =
      this.dashboardAttributeRepository.createQueryBuilder(
        'dashboardAttribute'
      );
    qb.leftJoinAndSelect('dashboardAttribute.user_campaign_id', 'user_campaign')
      .leftJoinAndSelect('user_campaign.campaign_type_id', 'campaign_type')
      .orderBy('dashboardAttribute.created_at', 'DESC');

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user_campaign.name ILIKE :search', {
            search: `%${query.search}%`
          });
        })
      );
    }

    const [result, total] = await qb.getManyAndCount();
    return {
      statusCode: 200,
      data: result,
      total
    };
  }

  async detailCustomDashboard(id: string) {
    const customDashboardData = await this.dashboardAttributeRepository.findOne(
      {
        relations: {
          user_campaign_id: true
        },
        where: { id }
      }
    );

    if (!customDashboardData) {
      throw new HttpException('User dashboard not found', 404);
    }

    return {
      statusCode: 200,
      data: customDashboardData
    };
  }

  async update(id: string, body: any) {
    const customDashboardData = await this.dashboardAttributeRepository.findOne(
      {
        where: {
          id
        }
      }
    );
    if (!customDashboardData) {
      throw new HttpException('User dashboard not found', 404);
    }
    customDashboardData.attribute_name =
      body.name || customDashboardData.attribute_name;
    customDashboardData.user_campaign_id =
      customDashboardData.user_campaign_id || body.user_campaign_id;

    await this.dashboardAttributeRepository.save(customDashboardData);
    return {
      statusCode: 200,
      message: 'User dashboard updated'
    };
  }
}
