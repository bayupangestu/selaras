import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';
import { PlatformStrategyFactory } from '@/shared/strategies';
import { AdSet } from '@/entity/ad-set.entity';

@Injectable()
export class UserAdsetService {
  constructor(
    @InjectRepository(UserAdsets)
    private readonly userAdsetsRepository: Repository<UserAdsets>,

    @InjectRepository(UserCampaign)
    private readonly userCampaignRepository: Repository<UserCampaign>,

    @InjectRepository(AdSet)
    private readonly adSetRepository: Repository<AdSet>,

    private readonly platformStrategyFactory: PlatformStrategyFactory
  ) {}

  async createUserAdset(body: any) {
    const userCampaignData = await this.userCampaignRepository.findOne({
      relations: {
        user_id: true,
        platform_id: true
      },
      where: { id: body.user_campaign_id }
    });
    if (!userCampaignData) {
      throw new HttpException('User Campaign not found', 404);
    }
    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      userCampaignData.platform_id.name
    );

    const adSetIdField = `${userCampaignData.platform_id.name}_adset_id`;
    if (!body[adSetIdField]) {
      throw new HttpException(
        `${adSetIdField} is required for ${userCampaignData.platform_id.name} platform`,
        400
      );
    }

    await platformStrategy.validateAdset(body[adSetIdField]);

    body.user = userCampaignData.user_id;
    body.user_campaign = userCampaignData;

    const userAdset = this.userAdsetsRepository.create(body);

    await this.userAdsetsRepository.save(userAdset);

    return {
      statusCode: 201,
      message: 'User Adset created!',
      data: userAdset
    };
  }

  async findAllUserAdsets(query: any) {
    if (query.type === 'form') {
      const result = await this.userAdsetsRepository.find({
        select: ['id', 'name'],
        relations: {
          user_id: true,
          user_campaign_id: true
        },
        where: {
          user_campaign_id: {
            id: query.user_campaign_id
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

    const qb = this.userAdsetsRepository.createQueryBuilder('userAdset');
    qb.leftJoinAndSelect('userAdset.user_id', 'user')
      .leftJoinAndSelect('userAdset.user_campaign_id', 'userCampaign')
      .leftJoinAndSelect('userAdset.meta_adset_id', 'adSet')
      .orderBy('userAdset.created_at', 'DESC');
    // .where('userAdset.user_campaign_id = :user_campaign_id', {
    //   user_campaign_id: query.user_campaign_id
    // });

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('userAdset.name ILIKE :search', {
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

  async findOneUserAdset(id: string) {
    const userAdset = await this.userAdsetsRepository.findOne({
      relations: {
        user_id: true,
        user_campaign_id: true,
        meta_adset_id: true
      },
      where: { id }
    });
    if (!userAdset) throw new HttpException('User Adset Not Found', 404);
    return {
      statusCode: 200,
      data: userAdset
    };
  }

  async updateUserAdset(id: string, body: any) {
    const userAdset = await this.userAdsetsRepository.findOne({
      relations: {
        user_id: true,
        user_campaign_id: true
      },
      where: { id }
    });
    if (!userAdset) throw new HttpException('User Adset Not Found', 404);

    const userCampaignData = await this.userCampaignRepository.findOne({
      relations: {
        platform_id: true
      },
      where: { id: body.user_campaign_id }
    });
    if (!userCampaignData) {
      throw new HttpException('User Campaign not found', 404);
    }

    body.user_campaign = userCampaignData;
    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      userCampaignData.platform_id.name
    );

    const adSetIdField = `${userCampaignData.platform_id.name}_adset_id`;
    if (!body[adSetIdField]) {
      throw new HttpException(
        `${adSetIdField} is required for ${userCampaignData.platform_id.name} platform`,
        400
      );
    }

    await platformStrategy.validateAdset(body[adSetIdField]);

    Object.assign(userAdset, body);
    await this.userAdsetsRepository.save(userAdset);

    return {
      statusCode: 200,
      message: 'User Adset updated!',
      data: userAdset
    };
  }

  async deleteUserAdset(id: string) {
    const userAdset = await this.userAdsetsRepository.findOne({
      relations: {
        user_id: true,
        user_campaign_id: true
      },
      where: { id }
    });
    if (!userAdset) throw new HttpException('User Adset Not Found', 404);

    await this.userAdsetsRepository.softRemove(userAdset);

    return {
      statusCode: 200,
      message: 'User Adset deleted!'
    };
  }

  async findAllMetaAdSet(query: any) {
    let option: any = {
      relations: { campaign: true },
      select: ['id', 'name']
    };

    option['where'] = option['where'] || {};

    if (query.campaign_id) {
      option['where']['campaign'] = { id: query.campaign_id };
    }
    console.log(query.campaign_id);

    if (query.search) {
      option['where']['name'] = ILike(`%${query.search}%`);
    }

    const result = await this.adSetRepository.find(option);
    return {
      statusCode: 200,
      data: result
    };
  }
}
