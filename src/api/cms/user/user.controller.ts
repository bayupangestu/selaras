import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async createUser(@Body() body: any) {
    return await this.userService.createUser(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findAll(@Query() query: any) {
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findOne(@Param('id') id: any) {
    return await this.userService.findOne(id);
  }
}
