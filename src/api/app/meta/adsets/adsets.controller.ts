import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AdsetsService } from './adsets.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('app/meta/adsets')
export class AdsetsController {
  @Inject(AdsetsService)
  private readonly adSetService: AdsetsService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findAll(@Query() query: any, @Req() req: any) {
    return await this.adSetService.findAll(query, req.user);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findOne(
    @Query() query: any,
    @Req() req: any,
    @Param('id') id: string
  ) {
    return await this.adSetService.findOne(query, req.user, id);
  }
}
