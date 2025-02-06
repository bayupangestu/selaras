import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { Platform } from '@/entity/platform.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Campaign } from '@/entity/campaign.entity';
import { PlatformStrategyFactory } from '@/shared/strategies';

@Injectable()
export class UserCampaignService {
  constructor(
    @InjectRepository(UserCampaign)
    private readonly userCampaignRepository: Repository<UserCampaign>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    private readonly platformStrategyFactory: PlatformStrategyFactory
  ) {}

  async createUserCampaign(body: any) {
    const userData = await this.userRepository.findOne({
      where: { id: body.user_id }
    });
    if (!userData) {
      throw new HttpException('User not found', 404);
    }
    const platformData = await this.platformRepository.findOne({
      where: { id: body.platform_id }
    });
    if (!platformData) {
      throw new HttpException('Platform not found', 404);
    }
    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      platformData.name
    );

    const campaignId = `${platformData.name}_campaign_id`;
    if (!body[campaignId]) {
      throw new HttpException(
        `${campaignId} is required for ${platformData.name} platform`,
        400
      );
    }

    await platformStrategy.validateCampaign(body[campaignId]); // Validasi adset
    const adsetMapping = { [campaignId]: body[campaignId] };

    body.user = userData;
    body.platform = platformData;

    const userCampaign = this.userCampaignRepository.create(body);
    await this.userCampaignRepository.save(userCampaign);

    return {
      statusCode: 201,
      message: 'User Campaign created!',
      data: userCampaign
    };
  }

  async findAllUserCampaigns(query: any) {
    if (query.type === 'form') {
      const result = await this.userCampaignRepository.find({
        relations: {
          user_id: true,
          platform_id: true
        },
        where: {
          user_id: {
            id: query.user_id
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

    const qb = this.userCampaignRepository.createQueryBuilder('userCampaign');
    qb.leftJoinAndSelect('userCampaign.user', 'user')
      .leftJoinAndSelect('userCampaign.platform', 'platform')
      .where('userCampaign.user = :userId', { userId: query.user_id });

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('userCampaign.name ILIKE :search', {
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

  async findOneUserCampaign(id: string) {
    const userCampaign = await this.userCampaignRepository.findOne({
      relations: {
        user_id: true,
        platform_id: true
      },
      where: { id }
    });
    if (!userCampaign) throw new HttpException('User Campaign Not Found', 404);
    return {
      statusCode: 200,
      data: userCampaign
    };
  }

  // async updateUserCampaign(id: string, body: any) {
  //   const userCampaign = await this.userCampaignRepository.findOne({
  //     relations: {
  //       user_id: true,
  //       platform_id: true
  //     },
  //     where: { id }
  //   });
  //   if (!userCampaign) throw new HttpException('User Campaign Not Found', 404);

  //   const platformData = await this.platformRepository.findOne({
  //     where: { id: body.platform_id }
  //   });
  //   if (!platformData) {
  //     throw new HttpException('Platform not found', 404);
  //   }

  //   body.platform = platformData;

  //   Object.assign(userCampaign, body);
  //   await this.userCampaignRepository.save(userCampaign);

  //   return {
  //     statusCode: 200,
  //     message: 'User Campaign updated!',
  //     data: userCampaign
  //   };
  // }
  async updateUserCampaign(id: string, body: any) {
    const userCampaign = await this.userCampaignRepository.findOne({
      relations: {
        user_id: true,
        platform_id: true
      },
      where: { id }
    });
    if (!userCampaign) {
      throw new HttpException('User Campaign Not Found', 404);
    }

    const platformData = await this.platformRepository.findOne({
      where: { id: body.platform_id }
    });
    if (!platformData) {
      throw new HttpException('Platform not found', 404);
    }

    const platformStrategy = await this.platformStrategyFactory.getStrategy(
      platformData.name
    );

    const campaignIdField = `${platformData.name}_campaign_id`;
    if (!body[campaignIdField]) {
      throw new HttpException(
        `${campaignIdField} is required for ${platformData.name} platform`,
        400
      );
    }

    await platformStrategy.validateCampaign(body[campaignIdField]);

    Object.assign(userCampaign, {
      ...body,
      [campaignIdField]: body[campaignIdField],
      platform: platformData
    });

    await this.userCampaignRepository.save(userCampaign);

    return {
      statusCode: 200,
      message: 'User Campaign updated!',
      data: userCampaign
    };
  }

  async deleteUserCampaign(id: string) {
    const userCampaign = await this.userCampaignRepository.findOne({
      relations: {
        user_id: true,
        platform_id: true
      },
      where: { id }
    });
    if (!userCampaign) throw new HttpException('User Campaign Not Found', 404);

    await this.userCampaignRepository.softRemove(userCampaign);

    return {
      statusCode: 200,
      message: 'User Campaign deleted!'
    };
  }
}
