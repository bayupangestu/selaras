import { Module } from '@nestjs/common';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from '@/entity/ad.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ad]), AuthModule],
  controllers: [AdController],
  providers: [AdService]
})
export class AdModule {}
