import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity/role.entity';
// import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    // @InjectRepository(Permission)
    // private readonly permissionRepository: Repository<Permission>,
  ) {}

  // -------------------------------
  // Create a normal user
  // -------------------------------
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, roleId } = createUserDto;

    // Check email
    const emailExists = await this.userRepository.findOne({ where: { email } });
    if (emailExists) throw new ConflictException('Email already exists');

    // Check username
    const usernameExists = await this.userRepository.findOne({ where: { username } });
    if (usernameExists) throw new ConflictException('Username already exists');

    // Find role (if roleId provided)
    let role: Role | undefined = undefined;
    if (roleId) {
      const foundRole = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
      if (!foundRole) throw new NotFoundException('Role not found');
      role = foundRole; // ✅ assign only if role exists
    }

    const user = this.userRepository.create({
      ...createUserDto,
      // role, // ✅ role is Role | undefined
    });

    return this.userRepository.save(user);
  }

  async getMe(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'], // include role and its permissions
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt'], // omit password
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -------------------------------
  // Seed Admin User
  // -------------------------------
  async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';

    // 1️⃣ Check if Admin user exists
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (existingAdmin) return console.log('ℹ️ Admin user already exists');

    // 2️⃣ Get or create Admin role
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });

    // if (!adminRole) {
    //   adminRole = this.roleRepository.create({
    //     name: 'admin',
    //     description: 'Administrator with all permissions',
    //   });

    //   // 3️⃣ Assign all existing permissions to Admin
    //   const allPermissions = await this.permissionRepository.find();
    //   adminRole.permissions = allPermissions;

    //   await this.roleRepository.save(adminRole);
    // }

    // 4️⃣ Create Admin user
    const adminUser = this.userRepository.create({
      username: adminUsername,
      email: adminEmail,
      password: 'admin123',
      // role: adminRole,
    });

    await this.userRepository.save(adminUser);
    console.log('✅ Admin user seeded with all permissions');
  }

  // -------------------------------
  // Assign Role to User
  // -------------------------------
  // async assignRole(userId: number, roleId: number) {
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) throw new NotFoundException('User not found');

  //   const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
  //   if (!role) throw new NotFoundException('Role not found');

  //   user.role = role; // ✅ role is guaranteed to exist here
  //   return this.userRepository.save(user);
  // }
}
