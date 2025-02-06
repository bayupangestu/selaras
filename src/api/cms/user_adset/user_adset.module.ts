import { Module } from '@nestjs/common';
import { UserAdsetController } from './user_adset.controller';
import { UserAdsetService } from './user_adset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/api/app/meta/auth/auth.module';
import { UserAdsets } from '@/entity/user-adset.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAdsets, UserCampaign, User]),
    AuthModule,
    SharedModule
  ],
  controllers: [UserAdsetController],
  providers: [UserAdsetService]
})
export class UserAdsetModule {}
