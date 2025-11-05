// src/users/users.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, Param, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AssignRoleDto } from 'src/roles/dto/assign-role.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/modules/uploads/uploads.service';
import { UpdateUserDto } from 'src/auth/dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ✅ Get current user - FIXED VERSION
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    console.log('👤 users/me - Request user:', req.user);
    console.log('👤 users/me - User ID from token:', req.user.id);

    try {
      const user = await this.usersService.findById(req.user.id);
      if (!user) {
        console.log('❌ User not found with ID:', req.user.sub);
        throw new Error('User not found');
      }

      console.log('✅ users/me - User found:', user.email);
      return user;
    } catch (error) {
      console.error('❌ users/me - Error:', error);
      throw error;
    }
  }

  // Assign role to user
  @Post('assign-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(dto.userId, dto.roleId);
  }

  // List all users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  // Update single user
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  update(@Param('id') id: number, @Body() dto: UpdateUserDto, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.updateUser(id, dto, file);
  }
}

// import { Controller, Post, Body, UseGuards, Get, Req, Param, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { AssignRoleDto } from 'src/roles/dto/assign-role.dto';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UploadsService } from 'src/modules/uploads/uploads.service';
// import { UpdateUserDto } from 'src/auth/dto/create-user.dto';

// // Remove @UseModule and PermissionGuard - use only role-based protection
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('users')
// export class UsersController {
//   constructor(
//     private usersService: UsersService,
//     private readonly uploadsService: UploadsService,
//   ) {}

//   // Assign role to user
//   @Post('assign-role')
//   @Roles('admin')
//   async assignRole(@Body() dto: AssignRoleDto) {
//     return this.usersService.assignRole(dto.userId, dto.roleId);
//   }

//   // Get current user - no guard needed (user can always see their own profile)
//   @Get('me')
//   async me(@Req() req: any) {
//     return this.usersService.findById(req.user.sub);
//   }

//   // List all users
//   @Get()
//   // @Roles('admin')
//   async findAll() {
//     return this.usersService.findAll();
//   }

//   // Update single user
//   @Put(':id')
//   @Roles('admin')
//   @UseInterceptors(
//     FileInterceptor('profileImage', {
//       storage: new UploadsService().getFileStorage(),
//       fileFilter: new UploadsService().fileFilter,
//     }),
//   )
//   update(@Param('id') id: number, @Body() dto: UpdateUserDto, @UploadedFile() file?: Express.Multer.File) {
//     return this.usersService.updateUser(id, dto, file);
//   }
// }
