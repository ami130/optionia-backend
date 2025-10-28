import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('terms')
export class TermsConditionsController {
  constructor(private readonly termsService: TermsConditionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  // @Roles('admin')
  create(@Body() dto: CreateTermsDto) {
    return this.termsService.create(dto);
  }

  @Get()
  findAll() {
    return this.termsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.termsService.findOne(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdateTermsDto) {
    return this.termsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.termsService.remove(id);
  }
}
