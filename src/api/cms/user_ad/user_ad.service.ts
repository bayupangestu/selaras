import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { User } from '@/entity/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UserAdService {
  @InjectRepository(UserAd)
  private readonly userAdRepository: Repository<UserAd>;

  @InjectRepository(UserAdsets)
  private readonly userAdsetsRepository: Repository<UserAdsets>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async createUserAd(body: any) {
    const userData = await this.userRepository.findOne({
      where: { id: body.user_id }
    });
    if (!userData) {
      throw new HttpException('User not found', 404);
    }

    const userAdsetData = await this.userAdsetsRepository.findOne({
      where: { id: body.adset_id }
    });
    if (!userAdsetData) {
      throw new HttpException('User Adset not found', 404);
    }

    body.user = userData;
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
        relations: {
          user_id: true,
          user_adset_id: true
        },
        where: {
          user_adset_id: {
            id: query.adset_id
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
    qb.leftJoinAndSelect('userAd.user', 'user')
      .leftJoinAndSelect('userAd.user_adset', 'userAdset')
      .where('userAd.user_adset_id = :user_adset_id', {
        user_adset_id: query.user_adset_id
      });

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

  async findOneUserAd(id: number, user: any) {
    const userAd = await this.userAdRepository.findOne({
      relations: {
        user_id: true,
        user_adset_id: true
      },
      where: { id }
    });
    if (!userAd) throw new HttpException('User Ad Not Found', 404);
    return {
      statusCode: 200,
      data: userAd
    };
  }

  async updateUserAd(id: number, body: any) {
    const userAd = await this.userAdRepository.findOne({
      relations: {
        user_id: true,
        user_adset_id: true
      },
      where: { id }
    });
    if (!userAd) throw new HttpException('User Ad Not Found', 404);

    const userAdsetData = await this.userAdsetsRepository.findOne({
      where: { id: body.adset_id }
    });
    if (!userAdsetData) {
      throw new HttpException('User Adset not found', 404);
    }

    body.user_adset = userAdsetData;

    Object.assign(userAd, body);
    await this.userAdRepository.save(userAd);

    return {
      statusCode: 200,
      message: 'User Ad updated!',
      data: userAd
    };
  }

  async deleteUserAd(id: number, user: any) {
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
}
