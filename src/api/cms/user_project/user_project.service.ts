import { UserProject } from '@/entity/user-project.entity';
import { User } from '@/entity/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectRepository(UserProject)
    private readonly userProjectRepository: Repository<UserProject>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createUserProject(body: any) {
    const userData = await this.userRepository.findOne({
      where: {
        id: body.user_id
      }
    });
    if (!userData) throw new HttpException('User not found', 404);
    const userProject = await this.userProjectRepository.create(body);
    await this.userProjectRepository.save(userProject);

    return {
      statusCode: 201,
      message: 'User project created!'
    };
  }

  async findAllUserProject(query: any) {
    if (query.type === 'form') {
      const result = await this.userProjectRepository.find({
        select: ['id', 'name'],
        relations: {
          user_id: true
        },
        where: {
          user_id: {
            id: query.user_id
          }
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

    const qb = this.userProjectRepository.createQueryBuilder('userProject');
    qb.leftJoinAndSelect('userProject.user_id', 'user').orderBy(
      'userProject.created_at',
      'DESC'
    );
    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('userProject.name ILIKE :search', {
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

  async findOneUserProject(id: string) {
    const userProject = await this.userProjectRepository.findOne({
      relations: {
        user_id: true
      },
      where: {
        id
      }
    });

    if (!userProject) throw new HttpException('User project not found', 404);
    return {
      statusCode: 200,
      data: userProject
    };
  }

  async updateUserProject(id: string, body: any) {
    const userProject = await this.userProjectRepository.findOne({
      where: { id }
    });
    if (!userProject) throw new HttpException('User project not found', 404);

    Object.assign(userProject, {
      ...body
    });

    await this.userProjectRepository.save(userProject);
    return {
      statusCode: 200,
      message: 'User project updated!'
    };
  }

  async deleteUserProject(id: string) {
    const userProject = await this.userProjectRepository.findOne({
      relations: {
        user_campaigns: true
      },
      where: {
        id
      }
    });
    if (!userProject) throw new HttpException('User project not found', 404);

    if (userProject.user_campaigns.length > 0)
      throw new HttpException('User project have active campaign', 400);

    await this.userProjectRepository.softRemove(userProject);

    return {
      statusCode: 200,
      message: 'User project deleted'
    };
  }
}
