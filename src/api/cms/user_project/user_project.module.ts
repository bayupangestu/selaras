import { Module } from '@nestjs/common';
import { UserProjectController } from './user_project.controller';
import { UserProjectService } from './user_project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entity/user.entity';
import { UserProject } from '@/entity/user-project.entity';
import { AuthModule } from '@/api/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProject]), AuthModule],
  controllers: [UserProjectController],
  providers: [UserProjectService]
})
export class UserProjectModule {}
