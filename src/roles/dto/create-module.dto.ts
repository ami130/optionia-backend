import { IsNotEmpty, IsString } from 'class-validator';
export class CreateModuleDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
}
