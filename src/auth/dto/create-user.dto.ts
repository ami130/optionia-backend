import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() username: string;
  @IsEmail() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() @MinLength(6) password: string;
  @IsNumber() @IsNotEmpty() roleId: number;
}
