import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AppModule } from './app/app.module';

@Module({
  imports: [UserModule, AppModule]
})
export class ApiModule {}
