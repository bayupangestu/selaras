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
import { UserAdService } from './user_ad.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/user-ad')
export class UserAdController {
  @Inject(UserAdService)
  private readonly userAdService: UserAdService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createUserAd(@Body() body: any) {
    return await this.userAdService.createUserAd(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllUserAds(@Query() query: any) {
    return await this.userAdService.findAllUserAds(query);
  }

  @Get('meta-ad')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllMetaAd(@Query() query: any) {
    return await this.userAdService.findAllMetaAd(query);
  }

  @Get('ad-budget')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getBudget(@Query() query: any) {
    return await this.userAdService.findBudget(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneUserAd(@Param('id') id: string) {
    return await this.userAdService.findOneUserAd(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUserAd(@Param('id') id: string, @Body() body: any) {
    return await this.userAdService.updateUserAd(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteUserAd(@Param('id') id: string) {
    return await this.userAdService.deleteUserAd(id);
  }
}
