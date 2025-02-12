import { CampaignType } from '@/entity/campaign-type.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class CampaignTypeService {
  constructor(
    @InjectRepository(CampaignType)
    private readonly campaignTypeRepository: Repository<CampaignType>
  ) {}

  async findOne(id: string) {
    const campaignTypeData = await this.campaignTypeRepository.findOne({
      where: {
        id
      }
    });
    if (!campaignTypeData)
      throw new HttpException('Campaign type not found', 404);

    return {
      statusCode: HttpStatus.OK,
      data: campaignTypeData
    };
  }

  async create(body: any) {
    if (!body.name) throw new HttpException('Name is required', 400);
    body.name = body.name.toLowerCase();
    const checkDuplicate = await this.campaignTypeRepository.findOne({
      where: { name: body.name }
    });

    if (checkDuplicate)
      throw new HttpException('Campaign type name is already exists', 404);

    const campaignType = await this.campaignTypeRepository.create(body);
    await this.campaignTypeRepository.save(campaignType);

    return {
      statusCode: 201,
      message: 'Campaign type created!'
    };
  }

  async findAll(query: any) {
    if (query.type === 'form') {
      const result = await this.campaignTypeRepository.find();
      return {
        statusCode: 200,
        data: result
      };
    }

    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb = this.campaignTypeRepository.createQueryBuilder('campaignType');
    qb.skip(skip).take(query.pageSize);
    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('campaignType.name ILIKE :search', {
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

  async update(id: string, body: any) {
    if (!body.name) throw new HttpException('Name is required', 400);

    const campaignTypeData = await this.campaignTypeRepository.findOne({
      where: { id }
    });

    if (!campaignTypeData) {
      throw new HttpException('Campaign type not found', 404);
    }

    const name = body.name.toLowerCase();

    const checkDuplicate = await this.campaignTypeRepository.findOne({
      where: {
        name
      }
    });

    if (checkDuplicate) {
      throw new HttpException('Name already exist', 400);
    }

    await this.campaignTypeRepository.update(id, {
      name
    });
    return {
      statusCode: 200,
      message: 'Campaign type updated!'
    };
  }
}
