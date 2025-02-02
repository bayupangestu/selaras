import { Module } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [AppModule, AuthModule, CmsModule]
})
export class ApiModule {}
