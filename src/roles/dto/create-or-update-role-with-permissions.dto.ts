import { IsOptional, IsString, IsNumber, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ModulePermission {
  @IsNumber()
  moduleId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}

export class CreateOrUpdateRoleWithPermissionsDto {
  @IsOptional()
  @IsNumber()
  roleId?: number; // Optional for update

  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ModulePermission)
  modules: ModulePermission[];
}
