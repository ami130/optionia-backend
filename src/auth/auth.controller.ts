import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { Roles } from './decorators/roles.decorator';
import { UploadsService } from 'src/modules/uploads/uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post('signup')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  async signup(@Body() dto: CreateUserDto, @UploadedFile() file?: Express.Multer.File) {
    const user = await this.usersService.create(dto, file);
    // const { password, ...rest } = user as any;
    // const token = await this.authService.login(rest);
    return user;
  }

  // @Post('login')
  // @UseGuards(LocalAuthGuard) // ✅ Use Passport local strategy
  // async login(@Body() dto: ValidateUserDto) {
  //   // LocalAuthGuard automatically validates user
  //   // validated user is available in request.user
  //   const validated = await this.authService.validateUser(dto.email, dto.password);

  //   return this.authService.login((dto as any).user); // or req.user if injected
  // }

  //   // @UseGuards(LocalAuthGuard)

  @Post('login')
  async login(@Body() dto: ValidateUserDto) {
    const validated = await this.authService.validateUser(dto.email, dto.password);
    if (!validated) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(validated as any);
  }
}
