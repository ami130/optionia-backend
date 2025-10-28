import { Controller, Post, Body, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from 'src/roles/dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private svc: PermissionsService) {}

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }
}
