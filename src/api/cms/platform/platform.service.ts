import { Platform } from '@/entity/platform.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class PlatformService {
  @InjectRepository(Platform)
  private readonly platformRepository: Repository<Platform>;

  async createPlatform(body: any) {
    body.name = body.name.toLowerCase();

    const checkDuplicate = await this.platformRepository.findOne({
      where: {
        name: body.name
      }
    });

    if (checkDuplicate)
      throw new HttpException('Platform name already exists', 400);

    const platform = this.platformRepository.create(body);
    await this.platformRepository.save(platform);
    return {
      statusCode: 201,
      message: 'Platform created!'
    };
  }

  async findAllPlatforms(query: any) {
    if (query.type) {
      const result = await this.platformRepository.find();
      return {
        statusCode: 200,
        data: result
      };
    }
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb = this.platformRepository.createQueryBuilder('platform');

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('platform.name ILIKE :search', {
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

  async findOnePlatform(id: string) {
    const platform = await this.platformRepository.findOne({
      where: { id }
    });
    if (!platform) throw new HttpException('Platform Not Found', 404);
    return {
      statusCode: 200,
      data: platform
    };
  }

  async updatePlatform(id: string, body: Partial<Platform>) {
    const platform = await this.platformRepository.findOne({
      where: { id }
    });
    if (!platform) throw new HttpException('Platform Not Found', 404);

    Object.assign(platform, body);
    await this.platformRepository.save(platform);

    return {
      statusCode: 200,
      message: 'Platform updated!'
    };
  }

  async deletePlatform(id: string) {
    const platform = await this.platformRepository.findOne({
      relations: {
        user_campaigns: true
      },
      where: { id }
    });
    if (!platform) throw new HttpException('Platform Not Found', 404);
    if (platform.user_campaigns.length > 0)
      throw new HttpException('Platform still have active campaign data', 400);

    await this.platformRepository.softDelete(id);

    return {
      statusCode: 200,
      message: 'Platform deleted!'
    };
  }
}
