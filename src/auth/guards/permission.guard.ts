// // src/auth/guards/permission.guard.ts
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requiredPerms || requiredPerms.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.role) return false;

    // Expect controller to set module slug on request.routeModule or via param; for simplicity assume route sets moduleSlug on request
    const moduleSlug = req.routeModule || req.params?.moduleSlug || req.headers['x-module'] || null;
    if (!moduleSlug) return false;

    // Check database for any matching permission assigned to the role for the module
    const matches = await this.rmpRepo
      .createQueryBuilder('rmp')
      .leftJoinAndSelect('rmp.role', 'role')
      .leftJoinAndSelect('rmp.module', 'module')
      .leftJoinAndSelect('rmp.permission', 'permission')
      .where('role.slug = :roleSlug', { roleSlug: user.role })
      .andWhere('module.slug = :moduleSlug', { moduleSlug })
      .andWhere('permission.slug IN (:...perms)', { perms: requiredPerms })
      .getMany();

    return matches.length > 0;
  }
}

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { PERMISSIONS_KEY } from 'src/permissions/decorators/permissions.decorator';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
//       PERMISSIONS_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return true;
//     }

//     const { user } = context.switchToHttp().getRequest();

//     if (!user || !user.role || !user.role.permissions) {
//       return false;
//     }

//     const userPermissions = user.role.permissions.map((p) => p.name);

//     const hasPermission = requiredPermissions.every((perm) =>
//       userPermissions.includes(perm),
//     );

//     if (!hasPermission) {
//       throw new ForbiddenException('You do not have permission');
//     }

//     return true;
//   }
// }
