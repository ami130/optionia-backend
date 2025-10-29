import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateUserDto } from './dto/validate-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { password, ...rest } = user as any;
    const token = await this.authService.login(rest);
    return token;
  }

  @Post('login')
  async login(@Body() dto: ValidateUserDto) {
    const validated = await this.authService.validateUser(dto.email, dto.password);
    if (!validated) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(validated as any);
  }
}

// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Controller, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LocalStrategy } from './strategies/local.strategy';
// import { ValidateUserDto } from './dto/validate-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UsersService } from 'src/users/users.service';

// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private usersService: UsersService,
//   ) {}

//   // @UseGuards(LocalStrategy)
//   @Post('login')
//   async login(@Body() validateUserDto: ValidateUserDto) {
//     const { email, password } = validateUserDto;

//     const user = await this.authService.validateUser(email, password);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     return this.authService.login(user);
//   }

//   @Post('signup')
//   async signup(@Body() createUserDto: CreateUserDto) {
//     const user = await this.usersService.createUser(createUserDto);

//     const { password, ...result } = user;

//     return {
//       ...result,
//       role: "admin", // ✅ return role name as string
//     };
//   }
// }
