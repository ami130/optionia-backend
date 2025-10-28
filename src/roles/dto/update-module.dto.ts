import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
