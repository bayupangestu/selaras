import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';
import { Campaign } from '@/entity/campaign.entity';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMetadataArgsStorage, ILike, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';

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
    private readonly adRepository: Repository<Ad>,

    @InjectRepository(InsightBreakdown)
    private readonly breakdownRepository: Repository<InsightBreakdown>
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

  async campaignUserDashboard(query: any) {
    // const budget = await this.userCampaignRepository.findOne({
    //   relations: {
    //     user_adsets: {
    //       user_ads: true
    //     }
    //   }
    // });

    return this.getDashboardData(
      query,
      'user_campaign_id',
      this.userCampaignRepository
      // budget
    );
  }

  async adSetDashboard(query: any) {
    // const budget = await this.userAdsetRepository.findOne({
    //   select: ['budget'],
    //   where: {
    //     id: query.user_adset_id
    //   }
    // });

    return this.getDashboardData(
      query,
      'user_adset_id',
      this.userAdsetRepository
      // budget
    );
  }

  async adDashboard(query: any) {
    // const budgetData = await this.userAdRepository.findOne({
    //   select: {
    //     user_adset_id: {
    //       budget: true
    //     }
    //   },
    //   relations: {
    //     user_adset_id: true
    //   },
    //   where: {
    //     id: query.user_ad_id
    //   }
    // });
    // if (!budgetData) {
    //   throw new HttpException('not found', 404);
    // }

    return this.getDashboardData(
      query,
      'user_ad_id',
      this.userAdRepository
      // budgetData.user_adset_id.budget
    );
  }

  private async getDashboardData(query: any, idField: string, repository: any) {
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

    filteredDashboard.forEach((item) => {
      const timePeriod =
        typeof item.time_period === 'string'
          ? item.time_period // Jika sudah dalam format string YYYY-MM-DD
          : new Date(item.time_period).toISOString().split('T')[0]; // Konversi jika bukan string

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

    delete aggregatedData.time_period;
    result.start_date = startDate;
    result.end_date = endDate;

    const resultValue = costPerResult + costPerResult * aggregatedData.spend;

    const amountSpend =
      resultValue *
      Array.from(metricsMap.values()).reduce((sum, value) => sum + value, 0);

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
}
