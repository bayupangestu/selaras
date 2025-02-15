import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
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

  @Get('find-all')
  @UseInterceptors(ClassSerializerInterceptor)
  private async findAll(@Query() query: any) {
    return await this.settingService.findAll(query);
  }

  @Get('find-one/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async findOne(@Param('id') id: string) {
    return await this.settingService.findOne(id);
  }

  @Put('update/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async update(@Param('id') id: string, @Body() body: any) {
    return await this.settingService.update(id, body);
  }
}
