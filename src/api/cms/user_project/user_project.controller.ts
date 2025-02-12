import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  Delete
} from '@nestjs/common';
import { JwtAuthGuard } from '@/api/auth/auth.guard';
import { UserProjectService } from './user_project.service';

@Controller('cms/user-project')
export class UserProjectController {
  @Inject(UserProjectService)
  private readonly userProjectService: UserProjectService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createUserProject(@Body() body: any) {
    return await this.userProjectService.createUserProject(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllUserProject(@Query() query: any) {
    return await this.userProjectService.findAllUserProject(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneUserProject(@Param('id') id: string) {
    return await this.userProjectService.findOneUserProject(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUserProject(@Param('id') id: string, @Body() body: any) {
    return await this.userProjectService.updateUserProject(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteUserProject(@Param('id') id: string) {
    return await this.userProjectService.deleteUserProject(id);
  }
}
