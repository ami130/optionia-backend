import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';

@UseModule('category')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Permissions('create')
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  // @Permissions('view')
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('view')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Permissions('update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
