import {
  Controller,
  Get,
  Query,
  Param,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AdService } from './ad.service'; // Adjust the import path as necessary
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('app/meta/ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: any, @Req() request: any) {
    const user = request.user; // Assuming you're using middleware to attach user
    return await this.adService.findAll(query, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.adService.findOne(id);
  }
}
