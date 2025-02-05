import { Module } from '@nestjs/common';
import { UserAdController } from './user_ad.controller';
import { UserAdService } from './user_ad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/api/auth/auth.module';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { User } from '@/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAd, UserAdsets, User]), AuthModule],
  controllers: [UserAdController],
  providers: [UserAdService]
})
export class UserAdModule {}
