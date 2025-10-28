// src/roles/dto/assign-role-permissions-bulk.dto.ts
import { IsInt, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ModulePermission {
  @IsInt()
  moduleId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds: number[];
}

export class AssignRolePermissionsBulkDto {
  @IsInt()
  roleId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ModulePermission)
  modules: ModulePermission[];
}
