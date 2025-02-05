import { Role } from '@/entity/role.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  public async create(body: any) {
    const checkDuplicate = await this.roleRepository.findOne({
      where: {
        name: body.name.toLowerCase()
      }
    });
    if (checkDuplicate) throw new HttpException('Role Name Duplicate', 400);
    body.name = body.name.toLowerCase();
    await this.roleRepository.save(body);
    return {
      statusCode: 201,
      message: 'Role created'
    };
  }

  public async findAll() {
    return await this.roleRepository.find();
  }
}
