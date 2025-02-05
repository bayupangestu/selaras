import { Module } from '@nestjs/common';
import { AdsetsController } from './adsets.controller';
import { AdsetsService } from './adsets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdSet } from '@/entity/ad-set.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdSet]), AuthModule],
  controllers: [AdsetsController],
  providers: [AdsetsService]
})
export class AdsetsModule {}
