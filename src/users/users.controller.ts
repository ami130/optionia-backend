import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AssignRoleDto } from 'src/roles/dto/assign-role.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Assign role to user
  @Post('assign-role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(dto.userId, dto.roleId);
  }

  // Get current user
  @Get('me')
  async me(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  // ✅ List all users
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  // ✅ Update single user
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: number,
    @Body() body: { username?: string; email?: string; roleId?: number },
  ) {
    return this.usersService.updateUser(id, body);
  }
}


// import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { UserRole } from './enum/userRole.enum';
// import { RoleGuard } from 'src/auth/guards/roles.guard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { UsersService } from './users.service';

// @Controller('user')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @UseGuards(RoleGuard)
//   @Roles(UserRole.ADMIN)
//   @Get('admin')
//   adminDashboard() {
//     return 'Admin dashboard';
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get('me')
//   async getMe(@Req() req: any) {
//     return this.usersService.getMe(req.user.id);
//   }

// @Post('users/:userId/assign-role')
// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles('admin')
// async assignRole(@Param('userId') userId: number, @Body() data: { roleId: number }) {
//   return this.usersService.assignRole(userId, data.roleId);
// }
// }
