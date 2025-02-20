import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entity/user.entity';
import { Repository } from 'typeorm';
import { AuthHelper } from './auth.helper';
import { Role } from '@/entity/role.entity';
import { bcryptCompare, bcryptHasPassword } from '@/shared/helper/bcrypt';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async register(body: any): Promise<User | never> {
    const roleData = await this.roleRepository.findOne({
      where: { name: body.role_name }
    });
    if (!roleData) {
      throw new HttpException('Role not found', 404);
    }
    let user: User = await this.repository.findOne({
      where: { email: body.email.toLowerCase() }
    });

    if (user) {
      throw new HttpException('User Already Exist', HttpStatus.BAD_REQUEST);
    }

    user = new User();

    user.name = body.name;
    user.email = body.email.toLowerCase();
    user.password = bcryptHasPassword(body.password);
    user.role_id = roleData;
    user.start_at = new Date(body.start_at);
    user.end_at = new Date(body.end_at);

    return this.repository.save(user);
  }

  public async login(body: any) {
    const { email, password }: any = body;
    const user: User = await this.repository.findOne({
      relations: {
        role_id: true
      },
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    if (user.end_at < new Date()) {
      throw new HttpException('User already expired', HttpStatus.BAD_REQUEST);
    }
    const isPasswordValid: boolean = bcryptCompare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    const result: any = {
      token: this.helper.generateToken(user)
    };
    this.repository.update(user.id, {
      last_login_at: new Date(),
      access_token: result.token
    });
    return {
      statusCode: 201,
      data: result.token,
      role: user.role_id.name
    };
  }

  public async refresh(user: User): Promise<string> {
    this.repository.update(user.id, { last_login_at: new Date() });

    return this.helper.generateToken(user);
  }

  public async updatePassword(body: any) {
    const user: User = await this.repository.findOne({
      relations: {
        role_id: true
      },
      where: { email: body.email.toLowerCase() }
    });
    user.password = bcryptHasPassword(body.password);
    await this.repository.save(user);
  }
}
