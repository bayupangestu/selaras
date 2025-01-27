import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  UseInterceptors
} from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('app/account')
export class AccountController {
  @Inject(AccountService)
  private readonly accountService: AccountService;

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  private async accountInsights() {
    return await this.accountService.fetchAndSaveInsights();
  }
}
