/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService, // ✅ fixed injection
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
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

    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }

  async findById(id: number) {
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

// import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { Role } from 'src/roles/entities/role.entity/role.entity';
// // import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
// import { CreateUserDto } from 'src/auth/dto/create-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     @InjectRepository(Role)
//     private readonly roleRepository: Repository<Role>,

//     // @InjectRepository(Permission)
//     // private readonly permissionRepository: Repository<Permission>,
//   ) {}

//   // -------------------------------
//   // Create a normal user
//   // -------------------------------
//   async createUser(createUserDto: CreateUserDto): Promise<User> {
//     const { email, username, roleId } = createUserDto;

//     // Check email
//     const emailExists = await this.userRepository.findOne({ where: { email } });
//     if (emailExists) throw new ConflictException('Email already exists');

//     // Check username
//     const usernameExists = await this.userRepository.findOne({ where: { username } });
//     if (usernameExists) throw new ConflictException('Username already exists');

//     // Find role (if roleId provided)
//     let role: Role | undefined = undefined;
//     if (roleId) {
//       const foundRole = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
//       if (!foundRole) throw new NotFoundException('Role not found');
//       role = foundRole; // ✅ assign only if role exists
//     }

//     const user = this.userRepository.create({
//       ...createUserDto,
//       // role, // ✅ role is Role | undefined
//     });

//     return this.userRepository.save(user);
//   }

//   async getMe(userId: number): Promise<User> {
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//       relations: ['role', 'role.permissions'], // include role and its permissions
//       select: ['id', 'username', 'email', 'createdAt', 'updatedAt'], // omit password
//     });

//     if (!user) throw new NotFoundException('User not found');
//     return user;
//   }

//   // -------------------------------
//   // Seed Admin User
//   // -------------------------------
//   async seedAdminUser() {
//     const adminEmail = 'admin@example.com';
//     const adminUsername = 'admin';

//     // 1️⃣ Check if Admin user exists
//     const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
//     if (existingAdmin) return console.log('ℹ️ Admin user already exists');

//     // 2️⃣ Get or create Admin role
//     let adminRole = await this.roleRepository.findOne({
//       where: { name: 'admin' },
//       relations: ['permissions'],
//     });

//     // if (!adminRole) {
//     //   adminRole = this.roleRepository.create({
//     //     name: 'admin',
//     //     description: 'Administrator with all permissions',
//     //   });

//     //   // 3️⃣ Assign all existing permissions to Admin
//     //   const allPermissions = await this.permissionRepository.find();
//     //   adminRole.permissions = allPermissions;

//     //   await this.roleRepository.save(adminRole);
//     // }

//     // 4️⃣ Create Admin user
//     const adminUser = this.userRepository.create({
//       username: adminUsername,
//       email: adminEmail,
//       password: 'admin123',
//       // role: "admin",
//       // role: adminRole,
//     });

//     await this.userRepository.save(adminUser);
//     console.log('✅ Admin user seeded with all permissions');
//   }

//   // -------------------------------
//   // Assign Role to User
//   // -------------------------------
//   // async assignRole(userId: number, roleId: number) {
//   //   const user = await this.userRepository.findOne({ where: { id: userId } });
//   //   if (!user) throw new NotFoundException('User not found');

//   //   const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
//   //   if (!role) throw new NotFoundException('Role not found');

//   //   user.role = role; // ✅ role is guaranteed to exist here
//   //   return this.userRepository.save(user);
//   // }
// }
