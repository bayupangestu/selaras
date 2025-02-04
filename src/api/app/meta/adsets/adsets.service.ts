import { AdSet } from '@/migrations/ad-set.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class AdsetsService {
  @InjectRepository(AdSet)
  private readonly adSetRepository: Repository<AdSet>;

  async findAll(query: any, user: any) {
    // If the query type is 'form', return all AdSets ordered by creation date
    if (query.type === 'form') {
      const result = await this.adSetRepository.find({
        relations: {
          user_id: true,
          campaign: true
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

    // Set up pagination
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    // Create a query builder for AdSets
    const qb = this.adSetRepository
      .createQueryBuilder('ad_set')
      .leftJoinAndSelect('ad_set.campaign', 'campaign') // Adjust if there's a relation
      .leftJoinAndSelect('ad_set.user_id', 'user') // Assuming ad_set has user_id relation
      .where('ad_set.user_id = :userId', { userId: user.id })
      .orderBy('ad_set.created_at', 'DESC');

    // Apply pagination
    qb.skip(skip).take(query.pageSize);

    // If a search term is provided, add search conditions
    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('ad_set.name ILIKE :search', {
            search: `%${query.search}%`
          }).orWhere('ad_set.ad_set_meta_id ILIKE :search', {
            search: `%${query.search}%`
          });
        })
      );
    }

    // Execute the query and get results
    const [result, total] = await qb.getManyAndCount();

    // Return the response
    return {
      statusCode: 200,
      data: result,
      total
    };
  }

  async findOne(query: any, user: any, id: string) {
    const adSet = await this.adSetRepository.findOne({
      relations: {
        campaign: true,
        user_id: true
      },
      where: {
        id
      }
    });
    if (!adSet) throw new HttpException('Ad Set Not Found', 404);
    return {
      statusCode: 200,
      data: adSet
    };
  }
}
