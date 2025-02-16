import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
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
    private readonly userCampaignRepository: Repository<UserCampaign>
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
      console.log(error, '<<<<<<');
      throw new HttpException(error.message, 400);
    } finally {
      await queryRunner.release();
    }
  }

  //   async campaignUserDashboard(query: any) {
  //     if (!query.user_campaign_id) {
  //       throw new HttpException(
  //         'user campaign id must be provided.',
  //         HttpStatus.BAD_REQUEST
  //       );
  //     }

  //     const userCampaignData = await this.userCampaignRepository.findOne({
  //       where: { id: query.user_campaign_id }
  //     });

  //     if (!userCampaignData) {
  //       throw new HttpException('User campaign not found', 404);
  //     }

  //     const userDashboard = await this.userDashboardRepository.find({
  //       relations: {
  //         dashboard_attribute_visibility_id: true,
  //         user_campaign_id: true
  //       },
  //       where: {
  //         user_campaign_id: { id: userCampaignData.id }
  //       }
  //     });

  //     if (!userDashboard || userDashboard.length === 0) {
  //       throw new HttpException('User dashboard not found', 404);
  //     }

  //     // **Langkah 1: Dapatkan daftar atribut yang boleh ditampilkan**
  //     const allowedAttributes = new Set(userDashboard[0].dashboard_attribute_visibility_id.attribute_name);

  //     // **Langkah 2: Proses data untuk digabungkan**
  //     const result = {
  //         user_campaign_id: userCampaignData.id,
  //         name: userCampaignData.name,
  //         budget: userCampaignData.budget,
  //         start_date: null,
  //         end_date: null,
  //     };

  //     // Menyimpan nilai yang akan dijumlahkan
  //     const aggregatedData: any = {};
  //     const jsonFields: string[] = ["demography"]; // Field JSON yang perlu digabungkan (thruplay diproses terpisah)
  //     let startDate: string | null = null;
  //     let endDate: string | null = null;

  //     // **Tambahkan struktur untuk menyimpan `thruplay` sebagai objek agregat**
  //     const aggregatedThruplay: Record<string, number> = {};

  //     userDashboard.forEach((item) => {
  //         const timePeriod = item.time_period;

  //         // Update start_date & end_date
  //         if (!startDate || new Date(timePeriod) < new Date(startDate)) {
  //             startDate = timePeriod;
  //         }
  //         if (!endDate || new Date(timePeriod) > new Date(endDate)) {
  //             endDate = timePeriod;
  //         }

  //         // Looping hanya untuk atribut yang diizinkan
  //         Object.keys(item).forEach((key) => {
  //             if (allowedAttributes.has(key)) {
  //                 if (typeof item[key] === "number") {
  //                     // Jika angka, jumlahkan
  //                     aggregatedData[key] = (aggregatedData[key] || 0) + item[key];
  //                 } else if (jsonFields.includes(key) && Array.isArray(item[key])) {
  //                     // Jika JSON/Array, gabungkan
  //                     aggregatedData[key] = [...(aggregatedData[key] || []), ...item[key]];
  //                 } else if (key === "thruplay" && Array.isArray(item[key])) {
  //                     // **Khusus untuk thruplay, jumlahkan berdasarkan action_type**
  //                     item[key].forEach((action) => {
  //                         const actionType = action.action_type;
  //                         const value = parseFloat(action.value) || 0;
  //                         aggregatedThruplay[actionType] = (aggregatedThruplay[actionType] || 0) + value;
  //                     });
  //                 } else {
  //                     // Jika bukan angka atau JSON, gunakan nilai terakhir
  //                     aggregatedData[key] = item[key];
  //                 }
  //             }
  //         });
  //     });

  //     // Set start_date & end_date
  //     result.start_date = startDate;
  //     result.end_date = endDate;

  //     // Konversi aggregatedThruplay menjadi array JSON
  //     aggregatedData["thruplay"] = Object.keys(aggregatedThruplay).map((actionType) => ({
  //         action_type: actionType,
  //         value: aggregatedThruplay[actionType].toFixed(6) // Pastikan hasil dalam format string dengan 6 desimal
  //     }));

  //     return { ...result, ...aggregatedData };
  // }

  async campaignUserDashboard(query: any) {
    if (!query.user_campaign_id) {
      throw new HttpException(
        'user campaign id must be provided.',
        HttpStatus.BAD_REQUEST
      );
    }

    const userCampaignData = await this.userCampaignRepository.findOne({
      where: { id: query.user_campaign_id }
    });

    if (!userCampaignData) {
      throw new HttpException('User campaign not found', 404);
    }

    const test = await this.userDashboardRepository.find({
      relations: {
        dashboard_attribute_visibility_id: true,
        user_campaign_id: true
      },
      where: {
        user_campaign_id: { id: userCampaignData.id }
      },
      order: {
        time_period: 'asc'
      }
    });

    return test;
    const userDashboard = await this.userDashboardRepository.find({
      relations: {
        dashboard_attribute_visibility_id: true,
        user_campaign_id: true
      },
      where: {
        user_campaign_id: { id: userCampaignData.id }
      }
    });

    if (!userDashboard || userDashboard.length === 0) {
      throw new HttpException('User dashboard not found', 404);
    }

    // **Fix: Pastikan filter tanggal mencakup satu hari penuh**
    let startDateFilter = query.start_date
      ? new Date(`${query.start_date}T00:00:00.000Z`)
      : null;
    let endDateFilter = query.end_date
      ? new Date(`${query.end_date}T23:59:59.999Z`)
      : null;

    const filteredDashboard = userDashboard.filter((item) => {
      const timePeriodDate = new Date(item.time_period);
      console.log(startDateFilter, endDateFilter);

      return (
        (!startDateFilter || timePeriodDate >= startDateFilter) &&
        (!endDateFilter || timePeriodDate <= endDateFilter)
      );
    });

    // **Jika tidak ada data, kembalikan semua `null`**
    if (filteredDashboard.length === 0) {
      return {
        user_campaign_id: userCampaignData.id,
        name: userCampaignData.name,
        budget: userCampaignData.budget,
        start_date: null,
        end_date: null,
        reach: null,
        impression: null,
        clicks: null,
        ctr: null,
        post_engagement: null,
        thruplay: null
      };
    }

    // **Proses Agregasi Data**
    const allowedAttributes = new Set(
      filteredDashboard[0].dashboard_attribute_visibility_id.attribute_name
    );
    const result: any = {
      user_campaign_id: userCampaignData.id,
      name: userCampaignData.name,
      budget: userCampaignData.budget,
      start_date: null,
      end_date: null
    };

    const aggregatedData: any = {};
    const jsonFields: string[] = ['demography'];
    let startDate = null;
    let endDate = null;
    const aggregatedThruplay: Record<string, number> = {};

    filteredDashboard.forEach((item) => {
      const timePeriod = item.time_period;

      if (!startDate || new Date(timePeriod) < new Date(startDate)) {
        startDate = timePeriod;
      }
      if (!endDate || new Date(timePeriod) > new Date(endDate)) {
        endDate = timePeriod;
      }

      Object.keys(item).forEach((key) => {
        if (allowedAttributes.has(key)) {
          if (typeof item[key] === 'number') {
            aggregatedData[key] = (aggregatedData[key] || 0) + item[key];
          } else if (jsonFields.includes(key) && Array.isArray(item[key])) {
            aggregatedData[key] = [
              ...(aggregatedData[key] || []),
              ...item[key]
            ];
          } else if (key === 'thruplay' && Array.isArray(item[key])) {
            item[key].forEach((action) => {
              const actionType = action.action_type;
              const value = parseFloat(action.value) || 0;
              aggregatedThruplay[actionType] =
                (aggregatedThruplay[actionType] || 0) + value;
            });
          } else {
            aggregatedData[key] = item[key];
          }
        }
      });
    });

    result.start_date = startDate;
    result.end_date = endDate;
    aggregatedData['thruplay'] = Object.keys(aggregatedThruplay).map(
      (actionType) => ({
        action_type: actionType,
        value: aggregatedThruplay[actionType].toFixed(6)
      })
    );

    return { ...result, ...aggregatedData };
  }

  async adSetDashboard(query: any) {
    if (!query.user_adset_id) {
      throw new HttpException(
        'user adset id must be provided.',
        HttpStatus.BAD_REQUEST
      );
    }

    const adSetDashboard = await this.userDashboardRepository.findOne({
      relations: {
        dashboard_attribute_visibility_id: true,
        user_adset_id: true
      },
      where: {
        user_adset_id: { id: query.user_adset_id }
      }
    });

    if (!adSetDashboard) {
      throw new HttpException('Ad set dashboard not found', 404);
    }

    // Extract visible attributes
    const visibleAttributes =
      adSetDashboard.dashboard_attribute_visibility_id.attribute_name;

    // Filter adSetDashboard object based on visibleAttributes
    const filteredDashboard = Object.keys(adSetDashboard)
      .filter(
        (key) =>
          visibleAttributes.includes(key) ||
          ['id', 'created_at', 'updated_at'].includes(key)
      )
      .reduce((obj, key) => {
        obj[key] = adSetDashboard[key];
        return obj;
      }, {});

    return filteredDashboard;
  }

  async adDashboard(query: any) {
    if (!query.user_ad_id) {
      throw new HttpException(
        'user ad id must be provided.',
        HttpStatus.BAD_REQUEST
      );
    }

    const adDashboard = await this.userDashboardRepository.findOne({
      relations: {
        dashboard_attribute_visibility_id: true,
        user_ad_id: true
      },
      where: {
        user_ad_id: { id: query.user_ad_id }
      }
    });

    if (!adDashboard) {
      throw new HttpException('Ad dashboard not found', 404);
    }

    // Extract visible attributes
    const visibleAttributes =
      adDashboard.dashboard_attribute_visibility_id.attribute_name;

    // Filter adDashboard object based on visibleAttributes
    const filteredDashboard = Object.keys(adDashboard)
      .filter(
        (key) =>
          visibleAttributes.includes(key) ||
          ['id', 'created_at', 'updated_at'].includes(key)
      )
      .reduce((obj, key) => {
        obj[key] = adDashboard[key];
        return obj;
      }, {});

    return filteredDashboard;
  }

  async listCustomDashboard(query: any) {
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb =
      this.dashboardAttributeRepository.createQueryBuilder(
        'dashboardAttribute'
      );
    qb.leftJoinAndSelect(
      'dashboardAttribute.user_campaign_id',
      'user_campaign'
    );

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
    console.log(customDashboardData, '<<<<<');

    await this.dashboardAttributeRepository.save(customDashboardData);
    return {
      statusCode: 200,
      message: 'User dashboard updated'
    };
  }
}
