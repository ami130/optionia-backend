import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TagService } from './tag.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { tagDto } from './dto/tag.dto';
import { Tag } from './entities/tag.entity';
import { commonQueryDto } from '../blog/dto/blog-query.dto';

@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTag(@Body() createTag: tagDto): Promise<Tag> {
    return this.tagService.createTag(createTag);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTag(@Query() query: commonQueryDto): Promise<{ data: Tag[]; count: number }> {
    return this.tagService.getAllTag(query);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTag(@Param('id') id: string): Promise<any> {
    return await this.tagService.deleteTag(+id);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatedTag(@Param('id') id: string, @Body() data: tagDto): Promise<any> {
    return this.tagService.updateTag(+id, data);
  }
}
