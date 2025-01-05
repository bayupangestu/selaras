import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/migrations/user.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthHelper {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  private readonly jwt: JwtService;

  constructor(jwt: JwtService) {
    this.jwt = jwt;
  }

  // Decode JWT Token
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }

  // Get User by User ID we get from decode()
  public async validateUser(decoced: any): Promise<User> {
    return await this.repository.findOne({ where: { id: decoced.id } });
  }

  // Generate JWT Token
  public generateToken(user: User): string {
    return this.jwt.sign({ id: user.id, email: user.email });
  }

  // Validate User's Password
  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  // Encode User's Password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  // Validate JWT Token, Throw forbidden error if JWT token is invalid
  private async validate(token: string): Promise<boolean | never> {
    const decoced: unknown = this.jwt.verify(token);
    if (!decoced) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    const user: User = await this.validateUser(decoced);
    if (!user) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
