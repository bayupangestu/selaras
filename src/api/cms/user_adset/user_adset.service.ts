import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UserAdsetService {
  @InjectRepository(UserAdsets)
  private readonly userAdsetsRepository: Repository<UserAdsets>;

  @InjectRepository(UserCampaign)
  private readonly userCampaignRepository: Repository<UserCampaign>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async createUserAdset(body: any) {
    const userData = await this.userRepository.findOne({
      where: { id: body.user_id }
    });
    if (!userData) {
      throw new HttpException('User not found', 404);
    }

    const userCampaignData = await this.userCampaignRepository.findOne({
      where: { id: body.user_campaign_id }
    });
    if (!userCampaignData) {
      throw new HttpException('User Campaign not found', 404);
    }

    body.user = userData;
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
        relations: {
          user_id: true,
          user_campaign_id: true
        },
        where: {
          user_campaign_id: {
            id: query.campaign_id
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
    qb.leftJoinAndSelect('userAdset.user', 'user')
      .leftJoinAndSelect('userAdset.user_campaign_id', 'userCampaign')
      .where('userAdset.user_campaign_id = :user_campaign_id', {
        user_campaign_id: query.user_campaign_id
      })
      .andWhere('');

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

  async findOneUserAdset(id: number) {
    const userAdset = await this.userAdsetsRepository.findOne({
      relations: {
        user_id: true,
        user_campaign_id: true
      },
      where: { id }
    });
    if (!userAdset) throw new HttpException('User Adset Not Found', 404);
    return {
      statusCode: 200,
      data: userAdset
    };
  }

  async updateUserAdset(id: number, body: any) {
    const userAdset = await this.userAdsetsRepository.findOne({
      relations: {
        user_id: true,
        user_campaign_id: true
      },
      where: { id }
    });
    if (!userAdset) throw new HttpException('User Adset Not Found', 404);

    const userCampaignData = await this.userCampaignRepository.findOne({
      where: { id: body.user_campaign_id }
    });
    if (!userCampaignData) {
      throw new HttpException('User Campaign not found', 404);
    }

    body.user_campaign = userCampaignData;

    Object.assign(userAdset, body);
    await this.userAdsetsRepository.save(userAdset);

    return {
      statusCode: 200,
      message: 'User Adset updated!',
      data: userAdset
    };
  }

  async deleteUserAdset(id: number) {
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
}
