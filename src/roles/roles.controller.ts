import { Controller, Post, Body, Get, Param, UseGuards, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  AssignRolePermissionsBulkDto,
} from './dto/assign-role-permissions-bulk.dto';
import { CreateOrUpdateRoleWithPermissionsDto } from './dto/create-or-update-role-with-permissions.dto';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can create
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Post('create-role-assign-permission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createOrUpdate(@Body() dto: CreateOrUpdateRoleWithPermissionsDto) {
    return this.rolesService.createOrUpdateRoleWithPermissions(dto);
  }

  @Post('assign-permission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can create
  assign(@Body() dto: AssignRolePermissionDto) {
    return this.rolesService.assignPermission(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto);
  }

  @Get()
  list() {
    return this.rolesService.findAllWithPermissions();
  }

  @Post('assign-permissions-bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  assignBulk(@Body() dto: AssignRolePermissionsBulkDto) {
    return this.rolesService.assignPermissionsBulk(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can create
  get(@Param('id') id: number) {
    return this.rolesService.getRoleWithPermissions(+id);
  }
}

// // src/roles/roles.controller.ts
// import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
// import { RolesService } from './roles.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RoleGuard } from 'src/auth/guards/roles.guard';
// import { Roles } from 'src/auth/decorators/roles.decorator';

// @Controller('roles')
// export class RolesController {
//   constructor(private readonly rolesService: RolesService) {}

//   @Post()
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles('admin')
//   async create(@Body('name') name: string) {
//     return this.rolesService.create(name);
//   }

//   @Get()
//   async findAll() {
//     return this.rolesService.findAll();
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: number) {
//     return this.rolesService.findOne(+id);
//   }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles('admin')
//   async update(@Param('id') id: number, @Body('name') name: string) {
//     return this.rolesService.update(+id, name);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles('admin')
//   async remove(@Param('id') id: number) {
//     return this.rolesService.remove(+id);
//   }
// }

// // import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
// // import { RolesService } from './roles.service';
// // import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// // import { RoleGuard } from 'src/auth/guards/roles.guard';
// // import { Roles } from 'src/auth/decorators/roles.decorator';
// // import { CreateRoleDto } from './dto/create-role.dto';
// // import { CreatePermissionDto } from './dto/create-permission.dto';
// // import { CreateModuleDto } from './dto/create-module.dto';
// // import { AssignRoleDto } from './dto/assign-role.dto';

// // @Controller('roles')
// // export class RolesController {
// //   constructor(private readonly rolesService: RolesService) {}

// //   // ---------------- MODULE ----------------
// //   @Post('module')
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   createModule(@Body() body: CreateModuleDto) {
// //     return this.rolesService.createModule(body.name);
// //   }

// //   @Get('modules')
// //   getModules() {
// //     return this.rolesService.getModules();
// //   }

// //   @Delete('module/:id')
// //   deleteModule(@Param('id') id: number) {
// //     return this.rolesService.deleteModule(id);
// //   }

// //   // ---------------- PERMISSION ----------------
// //   @Post('permission')
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   createPermission(@Body() body: CreatePermissionDto) {
// //     return this.rolesService.createPermission(body.name, body.module, body.description);
// //   }

// //   @Get('permissions')
// //   getPermissions() {
// //     return this.rolesService.getPermissions();
// //   }

// //   @Delete('permission/:id')
// //   deletePermission(@Param('id') id: number) {
// //     return this.rolesService.deletePermission(id);
// //   }

// //   // ---------------- ROLE ----------------
// //   @Post()
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   createRole(@Body() body: CreateRoleDto) {
// //     return this.rolesService.createRoleWithPermissions(body.name, body.permissionIds, body.description);
// //   }

// //   @Get()
// //   getRoles() {
// //     return this.rolesService.getRoles();
// //   }

// //   @Post('assign')
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   assignPermissions(@Body() body: { roleId: number; permissionIds: number[] }) {
// //     return this.rolesService.assignPermissionsToRole(body.roleId, body.permissionIds);
// //   }

// //   @Delete(':id')
// //   deleteRole(@Param('id') id: number) {
// //     return this.rolesService.deleteRole(id);
// //   }

// //   // ---------------- USER ROLES ----------------
// //   @Post('assign-role')
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   assignRoleToUser(@Body() body: AssignRoleDto) {
// //     return this.rolesService.assignRoleToUser(body.userId, body.roleId);
// //   }
// // }

// // import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
// // import { RolesService } from './roles.service';
// // import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// // import { RoleGuard } from 'src/auth/guards/roles.guard';
// // import { Roles } from 'src/auth/decorators/roles.decorator';
// // import { CreateRoleDto } from './dto/create-role.dto';

// // @Controller('roles')
// // export class RolesController {
// //   constructor(private readonly rolesService: RolesService) {}

// //   // @Post()
// //   // @UseGuards(JwtAuthGuard, RoleGuard)
// //   // @Roles('admin')
// //   // async createRole(@Body() data: { name: string; permissionIds: number[] }) {
// //   //   return this.rolesService.createRoleWithPermissions(data.name, data.permissionIds);
// //   // }

// //   @Post()
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   async createRole(@Body() data: CreateRoleDto) {
// //     const permissionIds = data.permissionIds || [];
// //     return this.rolesService.createRoleWithPermissions(data.name, permissionIds, data.description);
// //   }

// //   @Post('permission')
// //   async createPermission(@Body() body: { name: string; module: string; description?: string }) {
// //     return this.rolesService.createPermission(body.name, body.module, body.description);
// //   }

// //   @Post('assign')
// //   @UseGuards(JwtAuthGuard, RoleGuard)
// //   @Roles('admin')
// //   async assignPermission(@Body() body: { roleId: number; permissionIds: number[] }) {
// //     return this.rolesService.assignPermissionsToRole(body.roleId, body.permissionIds);
// //   }

// //   @Post('generate/:module')
// //   async generateModulePermissions(@Body() body: { module: string }) {
// //     return this.rolesService.generateModulePermissions(body.module);
// //   }

// //   @Get()
// //   getAllRoles() {
// //     return this.rolesService.getRoles();
// //   }

// //   @Get('permissions')
// //   getAllPermissions() {
// //     return this.rolesService.getPermissions();
// //   }
// // }
