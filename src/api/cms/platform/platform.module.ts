import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '@/entity/platform.entity';
import { AuthModule } from '@/api/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Platform]), AuthModule],
  controllers: [PlatformController],
  providers: [PlatformService]
})
export class PlatformModule {}
