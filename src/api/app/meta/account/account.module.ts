import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountInsights } from '@/migrations/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountInsights])],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {}
