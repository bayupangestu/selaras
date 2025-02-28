import { Ad } from '@/entity/ad.entity';
import { Insight } from '@/entity/insight.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { User } from '@/entity/user.entity';
import { PlatformStrategyFactory } from '@/shared/strategies';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, IsNull, Repository } from 'typeorm';
import { DashboardAttributeService } from '../dashboard_attribute/dashboard_attribute.service';

@Injectable()
export class UserAdService {
  constructor(
    @InjectRepository(UserAd)
    private readonly userAdRepository: Repository<UserAd>,

    @InjectRepository(UserAdsets)
    private readonly userAdsetsRepository: Repository<UserAdsets>,

    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,

    @Inject(DashboardAttributeService)
    private readonly userDashboardService: DashboardAttributeService,

    @InjectRepository(Insight)
    private readonly insightRepository: Repository<Insight>,

    private readonly platformStrategyFactory: PlatformStrategyFactory
  ) {}

  async createUserAd(body: any) {
    const userAdsetData = await this.userAdsetsRepository.findOne({
      relations: {
        user_campaign_id: {
          platform_id: true,
          user_id: true
        }
      },
      where: { id: body.adset_id }
    });
    if (!userAdsetData) {
      throw new HttpException('User Adset not found', 404);
    }

    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      userAdsetData.user_campaign_id.platform_id.name
    );

    const adIdField = `${userAdsetData.user_campaign_id.platform_id.name}_ad_id`;
    if (!body[adIdField]) {
      throw new HttpException(
        `${adIdField} is required for ${userAdsetData.user_campaign_id.platform_id.name} platform`,
        400
      );
    }

    await platformStrategy.validateAd(body[adIdField]);

    body.user = userAdsetData.user_campaign_id.user_id;
    body.user_adset = userAdsetData;

    const userAd = this.userAdRepository.create(body);

    await this.userAdRepository.save(userAd);

    return {
      statusCode: 201,
      message: 'User Ad created!',
      data: userAd
    };
  }

  async findAllUserAds(query: any) {
    if (query.type === 'form') {
      const result = await this.userAdRepository.find({
        select: ['id', 'name'],
        relations: {
          user_id: true,
          user_adset_id: true
        },
        where: {
          user_adset_id: {
            id: query.user_adset_id
          }
        },
        order: {
          created_at: 'DESC'
        }
      });
      return {
        statusCode: 200,
        data: result
      };
    }
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb = this.userAdRepository.createQueryBuilder('userAd');
    qb.leftJoinAndSelect('userAd.user_id', 'user')
      .leftJoinAndSelect('userAd.user_adset_id', 'userAdset')
      .leftJoinAndSelect('userAd.meta_ad_id', 'ad')
      .orderBy('userAd.created_at', 'DESC');
    // .where('userAd.user_adset_id = :user_adset_id', {
    //   user_adset_id: query.user_adset_id
    // });

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('userAd.name ILIKE :search', {
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

  async findOneUserAd(id: string) {
    const userAd = await this.userAdRepository.findOne({
      relations: {
        user_id: true,
        user_adset_id: true,
        meta_ad_id: true
      },
      where: { id }
    });
    if (!userAd) throw new HttpException('User Ad Not Found', 404);
    return {
      statusCode: 200,
      data: userAd
    };
  }

  async updateUserAd(id: string, body: any) {
    const userAd = await this.userAdRepository.findOne({
      relations: {
        user_id: true,
        user_adset_id: true
      },
      where: { id }
    });
    if (!userAd) throw new HttpException('User Ad Not Found', 404);

    const userAdsetData = await this.userAdsetsRepository.findOne({
      relations: {
        user_campaign_id: {
          platform_id: true
        }
      },
      where: { id: body.adset_id }
    });

    if (!userAdsetData) {
      throw new HttpException('User Adset not found', 404);
    }

    body.user_adset = userAdsetData;

    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      userAdsetData.user_campaign_id.platform_id.name
    );

    const adIdField = `${userAdsetData.user_campaign_id.platform_id.name}_ad_id`;
    if (!body[adIdField]) {
      throw new HttpException(
        `${adIdField} is required for ${userAdsetData.user_campaign_id.platform_id.name} platform`,
        400
      );
    }

    await platformStrategy.validateAd(body[adIdField]);

    Object.assign(userAd, body);
    await this.userAdRepository.save(userAd);

    return {
      statusCode: 200,
      message: 'User Ad updated!',
      data: userAd
    };
  }

  async deleteUserAd(id: string) {
    const userAd = await this.userAdRepository.findOne({
      relations: {
        user_id: true,
        user_adset_id: true
      },
      where: { id }
    });
    if (!userAd) throw new HttpException('User Ad Not Found', 404);

    await this.userAdRepository.softRemove(userAd);
    return {
      statusCode: 200,
      message: 'User Ad deleted!'
    };
  }

  async findAllMetaAd(query) {
    let option: any = {
      option: { ad_set_id: true },
      select: ['id', 'name', 'ad_meta_id']
    };

    option['where'] = option['where'] || {};

    if (query.adset_id) {
      option['where']['ad_set_id'] = { id: query.adset_id };
    }

    if (query.search) {
      option['where']['name'] = ILike(`%${query.search}%`);
    }
    const result = await this.adRepository.find(option);
    return {
      statusCode: 200,
      data: result
    };
  }

  async findBudget(query) {
    if (!query.ad_id) {
      throw new HttpException('Meta ad id is required', 400);
    }
    const budgetData = await this.insightRepository.find({
      relations: {
        ad_id: true
      },
      where: {
        ad_id: {
          id: query.ad_id
        }
      }
    });
    if (budgetData.length === 0) {
      return {
        statusCode: 200,
        message:
          'The ad has not started yet or its insight data has not been synced'
      };
    }
    const budget = {
      cost_per_mile: 0,
      cost_per_engagement: 0,
      cost_per_view: 0,
      cost_per_click: 0,
      cost_per_lead: 0
    };

    budgetData.forEach((insightData) => {
      budget.cost_per_mile =
        insightData.spend &&
        insightData.reach &&
        parseFloat(String(insightData.reach)) > 0
          ? Math.ceil(
              (parseFloat(String(insightData.spend)) /
                parseFloat(String(insightData.reach))) *
                1000
            )
          : 0;
      budget.cost_per_engagement =
        insightData.spend && insightData.post_engagement > 0
          ? Math.ceil(
              parseFloat(String(insightData.spend)) /
                insightData.post_engagement
            )
          : 0;

      budget.cost_per_view =
        insightData.spend && insightData.video_views > 0
          ? Math.ceil(
              parseFloat(String(insightData.spend)) / insightData.video_views
            )
          : 0;

      budget.cost_per_click =
        insightData.spend && insightData.link_click > 0
          ? Math.ceil(
              parseFloat(String(insightData.spend)) / insightData.link_click
            )
          : 0;

      budget.cost_per_lead =
        insightData.spend && insightData.lead > 0
          ? Math.ceil(parseFloat(String(insightData.spend)) / insightData.lead)
          : 0;
    });

    return budget;
  }
}
