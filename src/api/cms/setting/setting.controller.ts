import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { SettingService } from './setting.service';

@Controller('cms/setting')
export class SettingController {
  @Inject(SettingService)
  private readonly settingService: SettingService;

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  private async create(@Body() body: any) {
    return await this.settingService.create(body);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  private async get(@Query() query: any) {
    return await this.settingService.getValue(query.key);
  }
}
