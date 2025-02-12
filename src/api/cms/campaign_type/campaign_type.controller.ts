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
import { CampaignTypeService } from './campaign_type.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/campaign-type')
export class CampaignTypeController {
  @Inject(CampaignTypeService)
  private readonly campaignTypeService: CampaignTypeService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() body: any) {
    return await this.campaignTypeService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() query: any) {
    return await this.campaignTypeService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id') id: any) {
    return await this.campaignTypeService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Param('id') id: any, @Body() body: any) {
    return await this.campaignTypeService.update(id, body);
  }
}
