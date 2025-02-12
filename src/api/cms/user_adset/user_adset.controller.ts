import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  Delete
} from '@nestjs/common';

import { UserAdsetService } from './user_adset.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/user-adset')
export class UserAdsetController {
  @Inject(UserAdsetService)
  private readonly userAdsetsService: UserAdsetService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createUserAdset(@Body() body: any) {
    return await this.userAdsetsService.createUserAdset(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllUserAdsets(@Query() query: any) {
    return await this.userAdsetsService.findAllUserAdsets(query);
  }

  @Get('meta-adset')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllMetaAdset(@Query() query: any) {
    return await this.userAdsetsService.findAllMetaAdSet(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneUserAdset(@Param('id') id: string) {
    return await this.userAdsetsService.findOneUserAdset(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUserAdset(@Param('id') id: string, @Body() body: any) {
    return await this.userAdsetsService.updateUserAdset(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteUserAdset(@Param('id') id: string) {
    return await this.userAdsetsService.deleteUserAdset(id);
  }
}
