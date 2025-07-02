import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './enum/userRole.enum';
import { RoleGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  adminDashboard() {
    return 'Admin dashboard';
  }
}
