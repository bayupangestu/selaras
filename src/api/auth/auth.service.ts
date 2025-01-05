import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/migrations/user.entity";
import { Repository } from "typeorm";
import { AuthHelper } from "./auth.helper";

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async register(body: any): Promise<User | never> {
    const { name, email, password }: any = body;
    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException("Conflict", HttpStatus.CONFLICT);
    }

    user = new User();

    user.name = name;
    user.email = email;
    user.password = this.helper.encodePassword(password);

    return this.repository.save(user);
  }

  public async login(body: any): Promise<string | never> {
    const { email, password }: any = body;
    const user: User = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("No user found", HttpStatus.NOT_FOUND);
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpException("No user found", HttpStatus.NOT_FOUND);
    }

    this.repository.update(user.id, { last_login_at: new Date() });
    const result: any = {
      token: this.helper.generateToken(user),
    };
    return result;
  }

  public async refresh(user: User): Promise<string> {
    this.repository.update(user.id, { last_login_at: new Date() });

    return this.helper.generateToken(user);
  }
}
