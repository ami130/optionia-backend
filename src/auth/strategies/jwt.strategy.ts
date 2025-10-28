import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'changeme',
    });
  }

  async validate(payload: any) {
    // payload contains { username, sub, role }
    return { userId: payload.sub, username: payload.username, role: payload.role || null, sub: payload.sub };
  }
}

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { User } from 'src/users/entities/user.entity';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly configService: ConfigService,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>, // ✅ inject User repo
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
//     });
//   }

//   async validate(payload: any) {
//     const user = await this.userRepository.findOne({
//       where: { id: payload.sub },
//       relations: ['role', 'role.permissions'], // include role & permissions
//     });
//     if (!user) return null;
//     return user;
//   }
// }
