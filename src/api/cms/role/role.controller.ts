import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/role')
export class RoleController {
  @Inject(RoleService)
  private readonly roleService: RoleService;

  @Post()
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async createRole(@Body() body: any) {
    return await this.roleService.create(body);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findRole() {
    return await this.roleService.findAll();
  }
}
