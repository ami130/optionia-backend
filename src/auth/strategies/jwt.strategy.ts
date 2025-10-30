import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret', // Add fallback
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // Use the correct method name from your UsersService
    const user = await this.userService.findById(payload.sub, [
      'role', 
      'role.roleModulePermissions', 
      'role.roleModulePermissions.module', 
      'role.roleModulePermissions.permission'
    ]);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    // Make sure role has slug - if not, load role separately
    if (user.role && !user.role.slug) {
      user.role = await this.userService.findRoleById(user.role.id);
    }

    return user;
  }
}
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(config: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: config.get('JWT_SECRET') || 'changeme',
//     });
//   }

//   async validate(payload: any) {
//     // payload contains { username, sub, role }
//     return { userId: payload.sub, username: payload.username, role: payload.role || null, sub: payload.sub };
//   }
// }
