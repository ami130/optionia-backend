import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Important: tell passport to use 'email' not 'username'
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('🔍 LocalStrategy - Validating:', email);

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('❌ LocalStrategy - Validation failed');
      throw new UnauthorizedException();
    }

    console.log('✅ LocalStrategy - Validation successful');
    return user;
  }
}

// import { AuthService } from './../auth.service';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { ValidateUserDto } from '../dto/validate-user.dto';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({ usernameField: 'email' });
//   }

//   async validate(validateUserDto: ValidateUserDto): Promise<any> {
//     const { email, password } = validateUserDto;
//     const user = await this.authService.validateUser(email, password);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
