import { Module } from '@nestjs/common';
import { MetaModule } from './meta/meta.module';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [MetaModule, GoogleModule]
})
export class AppModule {}
