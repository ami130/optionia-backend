import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { tagDto, UpdateTagDto } from './dto/tag.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import { TagsService } from './tag.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  // Public endpoints - no authentication required
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Protected endpoints - require authentication and permissions
  @UseModule('tag')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('create')
  @Post()
  async create(@Body() dto: tagDto) {
    return this.service.create(dto);
  }

  @UseModule('tag')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.service.update(id, dto);
  }

  @UseModule('tag')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
