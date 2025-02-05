import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { PlatformService } from './platform.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/platform')
export class PlatformController {
  @Inject(PlatformService)
  private readonly platformService: PlatformService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createPlatform(@Body() body: any) {
    return await this.platformService.createPlatform(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllPlatforms(@Query() query: any) {
    return await this.platformService.findAllPlatforms(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOnePlatform(@Param('id') id: string) {
    return await this.platformService.findOnePlatform(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updatePlatform(@Param('id') id: string, @Body() body: any) {
    return await this.platformService.updatePlatform(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deletePlatform(@Param('id') id: string) {
    return await this.platformService.deletePlatform(id);
  }
}
