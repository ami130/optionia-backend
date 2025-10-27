import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './enum/userRole.enum';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  adminDashboard() {
    return 'Admin dashboard';
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  // @Post('users/:userId/assign-role')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles('admin')
  // async assignRole(@Param('userId') userId: number, @Body() data: { roleId: number }) {
  //   return this.usersService.assignRole(userId, data.roleId);
  // }
}
