import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountInsights } from '@/migrations/account.entity';
import { Setting } from '@/migrations/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountInsights, Setting])],
  controllers: [AccountController],
  providers: [AccountService, Setting]
})
export class AccountModule {}
