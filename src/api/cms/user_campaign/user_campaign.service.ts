import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { Platform } from '@/entity/platform.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UserCampaignService {
  @InjectRepository(UserCampaign)
  private readonly userCampaignRepository: Repository<UserCampaign>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Platform)
  private readonly platformRepository: Repository<Platform>;

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

  async findOneUserCampaign(id: number, user: any) {
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

  async updateUserCampaign(id: number, body: any, user: any) {
    const userCampaign = await this.userCampaignRepository.findOne({
      relations: {
        user_id: true,
        platform_id: true
      },
      where: { id }
    });
    if (!userCampaign) throw new HttpException('User Campaign Not Found', 404);

    const platformData = await this.platformRepository.findOne({
      where: { id: body.platform_id }
    });
    if (!platformData) {
      throw new HttpException('Platform not found', 404);
    }

    body.platform = platformData;

    Object.assign(userCampaign, body);
    await this.userCampaignRepository.save(userCampaign);

    return {
      statusCode: 200,
      message: 'User Campaign updated!',
      data: userCampaign
    };
  }

  async deleteUserCampaign(id: number, user: any) {
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
