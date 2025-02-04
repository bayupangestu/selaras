import { Campaign } from '@/migrations/campaign.entity';
import { User } from '@/migrations/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class CampaignService {
  @InjectRepository(Campaign)
  private readonly campaignRepository: Repository<Campaign>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async createCampaign(body: any, user: any) {
    const userData = await this.userRepository.findOne({
      where: {
        id: user.id
      }
    });
    if (!userData) {
      throw new HttpException('User not found', 404);
    }
    body.user_id = userData;
    await this.campaignRepository.save(body);
    return {
      statusCode: 201,
      message: 'Campaign created!'
    };
  }
  async findAllCampaign(query: any, user: any) {
    if (query.type === 'form') {
      const result = await this.campaignRepository.find({
        relations: {
          user_id: true
        },
        where: {
          user_id: user.id
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

    const qb = this.campaignRepository.createQueryBuilder('campaign');

    qb.leftJoinAndSelect('campaign.ad_account', 'ad_account')
      .leftJoinAndSelect('campaign.user_id', 'user')
      .where('campaign.user_id = :userId', { userId: user.id });

    qb.skip(skip).take(query.pageSize);
    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('campaign.name ILIKE :search', {
            search: `%${query.search}%`
          }).orWhere('campaign.campaign_meta_id ILIKE :search', {
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
  async findOneCampaign(query: any, user: any, id: string) {
    const campaign = await this.campaignRepository.findOne({
      relations: {
        user_id: true
      },
      where: {
        id
      }
    });
    if (!campaign) throw new HttpException('Campaign Not Found', 404);
    return {
      statusCode: 200,
      data: campaign
    };
  }
}
