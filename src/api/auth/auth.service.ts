import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/migrations/user.entity';
import { Repository } from 'typeorm';
import { AuthHelper } from './auth.helper';
import { Role } from '@/migrations/role.entity';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async register(body: any): Promise<User | never> {
    const { name, email, password, role_id }: any = body;
    const roleData = await this.roleRepository.findOne({
      where: { id: role_id }
    });
    if (!roleData) {
      throw new HttpException('Role not found', 404);
    }
    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    user = new User();

    user.name = name;
    user.email = email;
    user.password = this.helper.encodePassword(password);
    user.role_id = roleData;

    return this.repository.save(user);
  }

  public async login(body: any): Promise<string | never> {
    const { email, password }: any = body;
    const user: User = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password
    );

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
    return result;
  }

  public async refresh(user: User): Promise<string> {
    this.repository.update(user.id, { last_login_at: new Date() });

    return this.helper.generateToken(user);
  }
}
