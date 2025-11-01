import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔍 AuthService - Validating:', email);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      return null;
    }

    console.log('🔍 User found:', user.email);
    console.log('🔍 Stored password length:', user.password?.length);

    try {
      const isMatch = await user.comparePassword(password);
      console.log('🔍 Password match:', isMatch);

      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('❌ Auth validation error:', error);
      return null;
    }
  }
  // async validateUser(email: string, password: string) {
  //   const user = await this.usersService.findByEmail(email);
  //   if (user && (await user.comparePassword(password))) {
  //     const { password: _p, ...rest } = user as Partial<User>;
  //     return rest;
  //   }
  //   return null;
  // }

  async login(user: Partial<User>) {
    const payload = { username: user.username, sub: user.id, role: user.role?.slug ?? null };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, email: user.email, role: user.role?.slug ?? null },
    };
  }
}

// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ResponseService } from 'src/common/services/response.service';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     private responseService: ResponseService,
//     private jwtService: JwtService,
//   ) {}

//   async validateUser(email: string, pass: string): Promise<any> {
//     const user = await this.userRepository.findOne({ where: { email } });
//     if (user && (await user.comparePassword(pass))) {
//       const { password, ...result } = user;
//       return result;
//     }
//     return null;
//   }

//   async login(user: User) {
//     try {
//       const payload = {
//         email: user.email,
//         sub: user.id,
//         role: "admin",
//         // role: "user.role",
//       };
//       const accessToken = this.jwtService.sign(payload);

//       return this.responseService.authSuccess(
//         accessToken,
//         3600, // expires in 1 hour
//         {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: "admin", // ✅ string instead of Role entity
//           // role: "user.role?.name", // ✅ string instead of Role entity
//         },
//         // Add refreshToken here if you're using it
//       );
//     } catch (error) {
//       throw new UnauthorizedException('Could not generate token');
//     }
//   }
// }
