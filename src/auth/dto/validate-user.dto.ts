import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ValidateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(6)
  // @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
  //   message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  // })
  password: string;
}
