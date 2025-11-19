// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { Role } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import { Blog } from 'src/modules/blog/entities/blog.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { UploadsService } from 'src/modules/uploads/uploads.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    private readonly uploadsService: UploadsService,
  ) {}

  private removeFileIfExists(filePath: string) {
    if (filePath && fs.existsSync(path.join(process.cwd(), filePath))) {
      fs.unlinkSync(path.join(process.cwd(), filePath));
    }
  }

  async create(createDto: CreateUserDto, file?: Express.Multer.File): Promise<User> {
    const { email, username, roleId, designation, expertise } = createDto;

    if (await this.userRepo.findOne({ where: { email } })) throw new ConflictException('Email already exists');
    if (await this.userRepo.findOne({ where: { username } })) throw new ConflictException('Username already exists');

    let role: Role | null | undefined = undefined;
    if (roleId) {
      role = await this.roleRepo.findOne({ where: { id: roleId } });
      if (!role) throw new NotFoundException('Role not found');
    }

    const user = this.userRepo.create({
      ...createDto,
      designation,
      expertise: Array.isArray(expertise) ? expertise : expertise ? [expertise] : [],
      role: role || undefined,
    });

    if (file) this.uploadsService.mapFilesToData([file], user, ['profileImage']);

    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }

  // ✅ Find user by username WITH blogs
  async findByUsername(username: string) {
    console.log('🔍 Finding user by username:', username);

    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    // Get user's blogs
    const blogs = await this.blogRepo.find({
      where: { createdBy: { id: user.id } },
      relations: ['category', 'tags', 'authors', 'page'],
      order: { createdAt: 'DESC' },
    });

    console.log('📖 Found blogs for user:', blogs.length);

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      blogs: blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        keyTakeaways: blog.keyTakeaways,
        thumbnailUrl: blog.thumbnailUrl,
        readingTime: blog.readingTime,
        wordCount: blog.wordCount,
        featured: blog.featured,
        blogType: blog.blogType,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        category: blog.category
          ? {
              id: blog.category.id,
              name: blog.category.name,
              slug: blog.category.slug,
            }
          : null,
      
     
        authors: blog.authors?.map((author) => ({
          id: author.id,
          username: author.username,
          email: author.email,
          profileImage: author.profileImage,
        })),
      })),
    };
  }
  async findRoleById(roleId: number) {
    return this.roleRepo.findOne({
      where: { id: roleId },
      select: ['id', 'name', 'slug'],
    });
  }

  async findById(id: number, relations: string[] = []) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) return null;

    let roleModulePermissions: any = [];
    if (user.role) {
      roleModulePermissions = await this.rolesService.getRoleModulesWithPermissions(user.role.id);
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: user.role ? { ...user.role, roleModulePermissions } : null,
    };
  }

  async findAll() {
    const users = await this.userRepo.find({ relations: ['role'] });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  async updateUser(
    id: number,
    data: {
      username?: string;
      email?: string;
      roleId?: number;
      password?: any;
      bio?: string;
      linkedinProfile?: string;
      designation?: string;
      expertise?: string[];
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
    if (data.designation !== undefined) user.designation = data.designation;
    if (data.expertise !== undefined) {
      user.expertise = Array.isArray(data.expertise) ? data.expertise : data.expertise ? [data.expertise] : [];
    }

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

  // ✅ Get user's blogs by user ID
  async getUserBlogs(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const blogs = await this.blogRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['category', 'tags', 'authors'],
      order: { createdAt: 'DESC' },
    });

    console.log('blogs', blogs, userId);

    return blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      subtitle: blog.subtitle,
      thumbnailUrl: blog.thumbnailUrl,
      readingTime: blog.readingTime,
      featured: blog.featured,
      status: blog.status,
      createdAt: blog.createdAt,
      category: blog.category
        ? {
            id: blog.category.id,
            name: blog.category.name,
            slug: blog.category.slug,
          }
        : null,
      tags: blog.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
    }));
  }



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
      designation: 'System Administrator',
      expertise: ['System Management', 'User Administration'],
      role: adminRole,
    });

    await this.userRepo.save(user);
    await this.rolesService.assignAllPermissionsToAdmin();
    return user;
  }
}
