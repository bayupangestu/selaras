import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Ad } from '@/entity/ad.entity';

@Injectable()
export class AdService {
  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>
  ) {}

  async findAll(query: any, user: any) {
    if (query.type === 'form') {
      const result = await this.adRepository.find({
        relations: {
          user_id: true,
          ad_set_id: true
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

    const qb = this.adRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.campaign_id', 'campaign') // Adjust if necessary
      .leftJoinAndSelect('ad.user_id', 'user') // Adjust if necessary
      .leftJoinAndSelect('ad.ad_set_id', 'adSet') // Adjust if necessary
      .where('ad.user_id = :userId', { userId: user.id }) // Adjust to your field name
      .skip(skip)
      .take(query.pageSize)
      .orderBy('ad.created_at', 'DESC'); // Adjust if necessary

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('ad.name ILIKE :search', {
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

  async findOne(id: string) {
    const ad = await this.adRepository.findOne({
      relations: {
        user_id: true,
        campaign_id: true,
        ad_set_id: true
      },
      where: { id }
    });
    if (!ad) {
      throw new Error('Ad not found'); // Handle as appropriate
    }
    return {
      statusCode: 200,
      data: ad
    };
  }
}
