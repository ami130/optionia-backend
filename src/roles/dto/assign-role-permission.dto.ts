import { IsNumber } from 'class-validator';
export class AssignRolePermissionDto {
  @IsNumber() roleId: number;
  @IsNumber() moduleId: number;
  @IsNumber() permissionId: number;
}
