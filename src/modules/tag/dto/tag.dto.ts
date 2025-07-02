import { IsNotEmpty, IsString } from 'class-validator';

export class tagDto {
  @IsNotEmpty()
  @IsString()
  //   @IsUnique('name', { message: 'Tag Name already exists' })
  name: string;
}
