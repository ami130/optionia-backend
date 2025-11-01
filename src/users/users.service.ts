/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import { RolesService } from 'src/roles/roles.service';

import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { UploadsService } from 'src/modules/uploads/uploads.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService, // ✅ fixed injection
    private readonly uploadsService: UploadsService,
  ) {}

  private removeFileIfExists(filePath: string) {
    if (filePath && fs.existsSync(path.join(process.cwd(), filePath))) {
      fs.unlinkSync(path.join(process.cwd(), filePath));
    }
  }

  async create(createDto: CreateUserDto, file?: Express.Multer.File): Promise<User> {
    const { email, username, roleId } = createDto;

    if (await this.userRepo.findOne({ where: { email } })) throw new ConflictException('Email already exists');
    if (await this.userRepo.findOne({ where: { username } })) throw new ConflictException('Username already exists');

    let role: Role | null | undefined = undefined;
    if (roleId) {
      role = await this.roleRepo.findOne({ where: { id: roleId } });
      if (!role) throw new NotFoundException('Role not found');
    }

    const user = this.userRepo.create({
      ...createDto,
      role: role || undefined,
    });

    if (file) this.uploadsService.mapFilesToData([file], user, ['profileImage']);

    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }

  // Add this method to find role with slug
  async findRoleById(roleId: number) {
    return this.roleRepo.findOne({
      where: { id: roleId },
      select: ['id', 'name', 'slug'], // Make sure to select slug
    });
  }



  async findById(id: number, relations: string[] = []) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) return null;

    let roleModulePermissions: any = [];
    if (user.role) {
      roleModulePermissions = await this.rolesService.getRoleModulesWithPermissions(user.role.id);
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      role: user.role
        ? {
            ...user.role,
            roleModulePermissions,
          }
        : null,
    };
  }

  // Find all users
  async findAll() {
    const users = await this.userRepo.find({ relations: ['role'] });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  // Update single user
  async updateUser(
    id: number,
    data: {
      username?: string;
      email?: string;
      roleId?: number;
      password?: any;
      bio?: string;
      linkedinProfile?: string;
    },
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) throw new NotFoundException('User not found');

    // Update basic fields
    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;
    if (data.password) user.password = await bcrypt.hash(data.password, 10);

    if (data.roleId) {
      const role = await this.roleRepo.findOne({ where: { id: data.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      user.role = role;
    }

    // ✅ Update optional fields
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.linkedinProfile !== undefined) user.linkedinProfile = data.linkedinProfile;

    // ✅ Update profile image
    if (file) {
      if (user.profileImage) this.removeFileIfExists(user.profileImage);
      this.uploadsService.mapFilesToData([file], user, ['profileImage']);
    }

    const updated = await this.userRepo.save(user);
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async assignRole(userId: number, roleId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    user.role = role;
    return this.userRepo.save(user);
  }

  // ✅ Seed default Admin
  async seedAdmin(adminEmail = 'admin@example.com', adminPassword = 'admin123') {
    const existing = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (existing) return existing;

    let adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
    if (!adminRole) {
      adminRole = this.roleRepo.create({
        name: 'Admin',
        slug: 'admin',
      });
      await this.roleRepo.save(adminRole);
    }

    const user = this.userRepo.create({
      username: 'admin',
      email: adminEmail,
      password: adminPassword,
      ...(adminRole && { role: adminRole }),
    });

    await this.userRepo.save(user);
    await this.rolesService.assignAllPermissionsToAdmin();
    return user;
  }
}
