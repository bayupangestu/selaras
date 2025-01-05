import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/auth.guard";
import { UpdateNameDto } from "./user.dto";
import { User } from "@/migrations/user.entity";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Put("name")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private updateName(
    @Body() body: UpdateNameDto,
    @Req() req: Request
  ): Promise<User> {
    return this.service.updateName(body, req);
  }
}
