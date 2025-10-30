// src/auth/guards/permission.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
import { PERMISSIONS_KEY } from 'src/permissions/decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RoleModulePermission)
    private rmpRepo: Repository<RoleModulePermission>,
  ) {}

async canActivate(ctx: ExecutionContext): Promise<boolean> {
  const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
    ctx.getHandler(),
    ctx.getClass(),
  ]);

  console.log('🔐 Required Permissions:', requiredPerms);

  if (!requiredPerms || requiredPerms.length === 0) return true;

  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  console.log('👤 User:', user?.username);
  console.log('🎭 User Role:', user?.role?.slug);
  
  // Debug: Check ALL possible places where module could be set
  console.log('📦 req.routeModule:', req.routeModule);
  console.log('📦 req.params?.moduleSlug:', req.params?.moduleSlug);
  console.log('📦 req.headers[x-module]:', req.headers['x-module']);
  console.log('📦 All req keys:', Object.keys(req));

  if (!user || !user.role) return false;
  const roleSlug = user.role.slug;

  const moduleSlug = req.routeModule || req.params?.moduleSlug || req.headers['x-module'];
  
  console.log('🔍 Final Module Slug being used:', moduleSlug);

  if (!moduleSlug) {
    console.log('❌ No module slug found!');
    return false;
  }

  const matches = await this.rmpRepo
    .createQueryBuilder('rmp')
    .leftJoin('rmp.role', 'role')
    .leftJoin('rmp.module', 'module')
    .leftJoin('rmp.permission', 'permission')
    .where('role.slug = :roleSlug', { roleSlug })
    .andWhere('module.slug = :moduleSlug', { moduleSlug })
    .andWhere('permission.slug IN (:...perms)', { perms: requiredPerms })
    .getMany();

  console.log('✅ Database matches found:', matches.length);
  console.log('✅ Match details:', matches.map(m => ({
    role: m.role?.slug,
    module: m.module?.slug,
    permission: m.permission?.slug
  })));

  if (!matches || matches.length === 0) {
    throw new ForbiddenException('You do not have permission to access this resource');
  }

  return matches.length > 0;
}

  // Query RoleModulePermission table to check if user has at least one required permission for the module
  //   const matches = await this.rmpRepo
  //     .createQueryBuilder('rmp')
  //     .leftJoinAndSelect('rmp.role', 'role')
  //     .leftJoinAndSelect('rmp.module', 'module')
  //     .leftJoinAndSelect('rmp.permission', 'permission')
  //     .where('role.slug = :roleSlug', { roleSlug: user.role.slug }) // your role slug
  //     .andWhere('module.slug = :moduleSlug', { moduleSlug }) // module from route
  //     .andWhere('permission.slug IN (:...perms)', { perms: requiredPerms }) // required permissions
  //     .getMany();

  //   if (!matches || matches.length === 0) {
  //     throw new ForbiddenException('You do not have permission to access this resource');
  //   }

  //   return true;
  // }
}

// import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
// import { PERMISSIONS_KEY } from 'src/permissions/decorators/permissions.decorator';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
//   ) {}

//   async canActivate(ctx: ExecutionContext): Promise<boolean> {
//     const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
//       ctx.getHandler(),
//       ctx.getClass(),
//     ]);
//     if (!requiredPerms || requiredPerms.length === 0) return true;

//     const req = ctx.switchToHttp().getRequest();
//     const user = req.user;
//     if (!user || !user.role) return false;

//     // Expect controller to set module slug on request.routeModule or via param; for simplicity assume route sets moduleSlug on request
//     const moduleSlug = req.routeModule || req.params?.moduleSlug || req.headers['x-module'] || null;
//     if (!moduleSlug) return false;

//     // Check database for any matching permission assigned to the role for the module
//     const matches = await this.rmpRepo
//       .createQueryBuilder('rmp')
//       .leftJoinAndSelect('rmp.role', 'role')
//       .leftJoinAndSelect('rmp.module', 'module')
//       .leftJoinAndSelect('rmp.permission', 'permission')
//       .where('role.slug = :roleSlug', { roleSlug: user.role })
//       .andWhere('module.slug = :moduleSlug', { moduleSlug })
//       .andWhere('permission.slug IN (:...perms)', { perms: requiredPerms })
//       .getMany();

//     return matches.length > 0;
//   }
// }
