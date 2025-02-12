import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { Platform } from '@/entity/platform.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';
import { Campaign } from '@/entity/campaign.entity';
import { PlatformStrategyFactory } from '@/shared/strategies';
import { UserProject } from '@/entity/user-project.entity';

@Injectable()
export class UserCampaignService {
  constructor(
    @InjectRepository(UserCampaign)
    private readonly userCampaignRepository: Repository<UserCampaign>,

    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,

    @InjectRepository(UserProject)
    private readonly userProjectRepository: Repository<UserProject>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    private readonly platformStrategyFactory: PlatformStrategyFactory
  ) {}

  async createUserCampaign(body: any) {
    const userProjectData = await this.userProjectRepository.findOne({
      relations: {
        user_id: true
      },
      where: { id: body.user_project_id }
    });
    if (!userProjectData) {
      throw new HttpException('User project not found', 404);
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

    body.user_project_id = userProjectData;
    body.platform = platformData;
    body.user_id = userProjectData.user_id;

    const userCampaign = await this.userCampaignRepository.create(body);
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
        select: ['id', 'name'],
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
    qb.leftJoinAndSelect('userCampaign.user_id', 'user')
      .leftJoinAndSelect('userCampaign.platform_id', 'platform')
      .leftJoinAndSelect('userCampaign.user_project_id', 'project');
    // .where('userCampaign.user_project_id = :projectId', {
    //   projectId: query.user_project_id
    // });

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
        platform_id: true,
        user_adsets: true
      },
      where: { id }
    });
    if (!userCampaign) throw new HttpException('User Campaign Not Found', 404);

    if (userCampaign.user_adsets.length > 0)
      throw new HttpException('User Campaign have active adsets', 400);

    await this.userCampaignRepository.softRemove(userCampaign);

    return {
      statusCode: 200,
      message: 'User Campaign deleted!'
    };
  }

  async findAllMetaCampaign(query) {
    let option: any = {
      select: ['id', 'name']
    };
    if (query.search) {
      option['where'] = option['where'] || {};
      option['where']['name'] = ILike(`%${query.search}%`);
    }
    const result = await this.campaignRepository.find(option);
    return {
      statusCode: 200,
      data: result
    };
  }
}
