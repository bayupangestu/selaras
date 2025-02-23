import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository, getMetadataArgsStorage } from 'typeorm';
import { FB } from 'fb';
import * as ExcelJS from 'exceljs';
import * as moment from 'moment';
import { CronService } from '@/api/app/meta/cron/cron.service';

@Injectable()
export class DashboardAttributeService {
  private fb: FB;
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

    @InjectRepository(InsightBreakdown)
    private readonly breakdownRepository: Repository<InsightBreakdown>,

    @Inject(CronService)
    private readonly cronService: CronService
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
    const budgetData = await this.getBudgetData(
      this.userCampaignRepository,
      query,
      'user_campaign_id',
      {
        user_adsets: {
          user_ads: true
        },
        meta_campaign_id: true
      }
    );

    return this.getDashboardData(
      query,
      'user_campaign_id',
      this.userCampaignRepository,
      budgetData.budget,
      budgetData.campaign_meta_id.campaign_meta_id
    );
  }

  async adSetDashboard(query: any) {
    const budgetData = await this.getBudgetData(
      this.userAdsetRepository,
      query,
      'user_adset_id',
      { user_ads: true, meta_adset_id: true }
    );

    return this.getDashboardData(
      query,
      'user_adset_id',
      this.userAdsetRepository,
      budgetData.budget,
      budgetData.meta_adset_id.adset_meta_id
    );
  }

  async adDashboard(query: any) {
    const budgetData = await this.getBudgetData(
      this.userAdRepository,
      query,
      'user_ad_id',
      { meta_ad_id: true }
    );

    return this.getDashboardData(
      query,
      'user_ad_id',
      this.userAdRepository,
      budgetData.budget,
      budgetData.meta_ad_id.ad_meta_id
    );
  }

  async getBudgetData(repository, query, idKey, relations) {
    const budgetData = await repository.findOne({
      relations: relations,
      where: {
        id: query[idKey]
      }
    });

    if (!budgetData) {
      return null; // Handle case when no data is found
    }

    let budgets = [];

    if (budgetData.user_ads) {
      budgets = budgetData.user_ads.map((ad) => ({ budget: ad.budget, ad }));
    } else if (budgetData.user_adsets) {
      budgetData.user_adsets.forEach((adset) => {
        if (adset.user_ads) {
          budgets.push(
            ...adset.user_ads.map((ad) => ({ budget: ad.budget, ad }))
          );
        }
      });
    } else if (budgetData.budget) {
      return budgetData;
    }

    if (budgets.length === 0) {
      return null;
    } else if (budgets.length === 1) {
      return {
        ...budgets[0],
        campaign_meta_id: budgetData.meta_campaign_id || null,
        meta_adset_id: budgetData.meta_adset_id || null
      };
    } else {
      const minBudget = budgets.reduce((min, current) =>
        current.budget < min.budget ? current : min
      );

      return {
        ...minBudget,
        campaign_meta_id: budgetData.meta_campaign_id || null,
        meta_adset_id: budgetData.meta_adset_id || null
      };
    }
  }

  private async getDashboardData(
    query: any,
    idField: string,
    repository: any,
    budget: number,
    idPath: string
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

    if (!query.filter) {
      throw new HttpException('Filter is required', 400);
    }

    const queryBuilder = this.userDashboardRepository
      .createQueryBuilder('dashboard')
      .leftJoinAndSelect(
        'dashboard.dashboard_attribute_visibility_id',
        'attribute_visibility'
      )
      .leftJoinAndSelect('dashboard.campaign_type_id', 'campaign_type')
      .leftJoinAndSelect('dashboard.insight_breakdown_id', 'insight_breakdown')
      .leftJoinAndSelect('dashboard.meta_campaign_id', 'campaigns')
      .leftJoinAndSelect('dashboard.meta_adset_id', 'adsets')
      .leftJoinAndSelect('dashboard.meta_ad_id', 'ads')
      .where(`dashboard.${idField} = :id`, { id: entityData.id });

    if (query.filter.includes('all')) {
      queryBuilder.andWhere('insight_breakdown.id IS NULL');
    } else {
      const filterIds = Array.isArray(query.filter)
        ? query.filter.filter(
            (id) => typeof id === 'string' && id.length === 36
          )
        : [query.filter].filter(
            (id) => typeof id === 'string' && id.length === 36
          );

      if (filterIds.length > 0) {
        queryBuilder.andWhere('insight_breakdown.id IN (:...filterIds)', {
          filterIds
        });
      } else {
        throw new HttpException('Invalid filter ID format', 400);
      }
    }

    const userDashboard = await queryBuilder.getMany();

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
    const metricsMap: Map<string, number> = new Map();
    let startDate = null;
    let endDate = null;
    let costPerResult: any;
    let metricName: string;
    let count = filteredDashboard.length;
    let amountSpend;

    filteredDashboard.forEach((item) => {
      const timePeriod =
        typeof item.time_period === 'string'
          ? item.time_period
          : new Date(item.time_period).toISOString().split('T')[0];

      if (!startDate || new Date(timePeriod) < new Date(startDate)) {
        startDate = timePeriod;
      }
      if (!endDate || new Date(timePeriod) > new Date(endDate)) {
        endDate = timePeriod;
      }

      const campaignType = item.campaign_type_id?.name || 'Unknown';

      const metricKey = (() => {
        switch (campaignType.toLowerCase()) {
          case 'cpm':
            costPerResult = item.cost_per_mile;
            metricName = 'reach';
            return 'reach';
          case 'cpc':
            costPerResult = item.cost_per_click;
            metricName = 'link_click';
            return 'link_click';
          case 'cpl':
            costPerResult = item.cost_per_lead;
            metricName = 'lead';
            return 'lead';
          case 'cpe':
            costPerResult = item.cost_per_engagement;
            metricName = 'post_engagement';
            return 'post_engagement';
          case 'cpv':
            costPerResult = item.cost_per_view;
            metricName = 'video_views';
            return 'video_views';
          default:
            return null;
        }
      })();

      if (metricKey) {
        metricsMap.set(
          timePeriod,
          (metricsMap.get(timePeriod) || 0) + (item[metricKey] || 0)
        );
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

    if (query.start_date !== query.end_date) {
      const dateRange = { since: query.start_date, until: query.end_date };
      const path = `${idPath}/insights`;
      console.log(path, '<<<');
      const reachData = await this.getReach(path, dateRange);
      aggregatedData.reach = Number(reachData[0].reach);
    }

    [
      'cost_per_mile',
      'cost_per_engagement',
      'cost_per_view',
      'cost_per_click',
      'cost_per_lead'
    ].forEach((key) => {
      if (aggregatedData[key] !== undefined) {
        aggregatedData[key] = aggregatedData[key] / count + budget;
        if (metricName === 'reach' || metricName === 'impression') {
          amountSpend =
            (aggregatedData[metricName] * aggregatedData['cost_per_mile']) /
            1000;
        } else if (metricName === 'post_engagement') {
          amountSpend =
            aggregatedData[metricName] * aggregatedData['cost_per_engagement'];
        } else if (metricName === 'video_views') {
          amountSpend =
            aggregatedData[metricName] * aggregatedData['cost_per_view'];
        } else if (metricName === 'link_click') {
          amountSpend =
            aggregatedData[metricName] * aggregatedData['cost_per_click'];
        } else if (metricName === 'lead') {
          amountSpend =
            aggregatedData[metricName] * aggregatedData['cost_per_lead'];
        }
      }
    });

    delete aggregatedData.time_period;
    result.start_date = startDate;
    result.end_date = endDate;

    // const amountSpend = aggregatedData[metricName] * aggregatedData.spend;

    const data_card = {
      ...aggregatedData,
      amount_spend: amountSpend
    };

    const metrics = Array.from(metricsMap.entries()).map(([date, value]) => ({
      date,
      name: metricName,
      value
    }));

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

  async getFilterList() {
    const columns = this.getEntityColumns(InsightBreakdown);

    return {
      statusCode: 200,
      data: columns
    };
  }

  async getFilterValue(column: keyof InsightBreakdown) {
    const value = await this.breakdownRepository.find({
      select: ['id', column] as (keyof InsightBreakdown)[]
    });

    const filteredData = value.filter((item) => item[column] !== null);

    return {
      statusCode: 200,
      data: filteredData.map((item) => ({ id: item.id, name: item[column] }))
    };
  }

  async getDataCardReportCsv(res: any, campaignData: any) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Campaign Report');

      let name;
      if (campaignData.user_campaign_id) {
        name = 'Campaign Name';
      } else if (campaignData.user_adset_id) {
        name = 'Adset Name';
      } else if (campaignData.user_ad_id) {
        name = 'Ad Name';
      }
      // Data utama kampanye
      const campaignInfo = [
        [name, campaignData.name || '-'],
        ['Start Date', campaignData.start_date || '-'],
        ['End Date', campaignData.end_date || '-']
      ];

      campaignInfo.forEach((row) => worksheet.addRow(row));
      worksheet.addRow([]); // Spasi sebelum data card

      // Pastikan data_card ada
      if (
        !campaignData.data_card ||
        Object.keys(campaignData.data_card).length === 0
      ) {
        worksheet.addRow(['No data available']);
      } else {
        // Ambil semua kunci dari data_card
        const headers = Object.keys(campaignData.data_card);

        // Tambahkan Header dengan border dan background
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F81BD' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Tambahkan data
        const dataRow = headers.map((key) => {
          if (Array.isArray(campaignData.data_card[key])) {
            return campaignData.data_card[key]
              .map((item: any) => `${item.action_type}: ${item.value}`)
              .join('\n'); // Gunakan newline agar lebih terbaca
          }
          return campaignData.data_card[key] ?? '-';
        });

        worksheet.addRow(dataRow);
      }

      // Auto-size kolom
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          if (cell.value && cell.value.toString().length > maxLength) {
            maxLength = cell.value.toString().length;
          }
        });
        column.width = maxLength < 15 ? 15 : maxLength;
      });

      // Konfigurasi response untuk file Excel
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="campaign_report.xlsx"'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  }

  private async getReach(path, time_range) {
    const fb = await this.cronService.initializeFB();
    const response: any = await new Promise((resolve, reject) => {
      fb.api(
        path,
        'GET',
        {
          fields: ['reach'],
          time_range
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
  }
}
