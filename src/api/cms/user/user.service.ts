import { Role } from '@/entity/role.entity';
import { User } from '@/entity/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { bcryptHasPassword } from '@/shared/helper/bcrypt';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  public async createUser(body: any) {
    const roleData = await this.roleRepository.findOne({
      where: { name: body.role_name }
    });
    if (!roleData) {
      throw new HttpException('Role not found', 404);
    }
    let user: User = await this.userRepository.findOne({
      where: { email: body.email.toLowerCase() }
    });

    if (user) {
      throw new HttpException('User Already Exist', HttpStatus.BAD_REQUEST);
    }

    user = new User();

    user.name = body.name;
    user.email = body.email.toLowerCase();
    user.password = await bcryptHasPassword(body.password);
    user.role_id = roleData;
    user.start_at = new Date(body.start_at);
    user.end_at = new Date(body.end_at);

    await this.userRepository.save(user);
    return {
      statusCode: 201,
      message: 'User Created!'
    };
  }

  public async updateUser(body: any, id: string) {
    const userData = await this.userRepository.findOne({
      where: {
        id
      }
    });
    if (!userData) throw new HttpException('User not found', 404);
  }

  public async findAll(query: any) {
    if (query.type === 'user') {
      const result = await this.userRepository.find({
        relations: {
          role_id: true
        },
        where: {
          role_id: {
            name: 'user'
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

    const qb = this.userRepository.createQueryBuilder('platform');

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

  public async findOne(id: any) {
    const result = await this.userRepository.findOne({
      where: {
        id
      }
    });
    if (!result) throw new HttpException('User not found', 404);
    return {
      statusCode: 200,
      data: result
    };
  }
}
