// import { IsUnique } from 'src/validators/is-unique.validator';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/users/enum/userRole.enum';
// import { User } from 'src/users/entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  // @IsUnique(User, 'username', { message: 'username must be unique' })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  // @IsUnique(User, 'email', { message: 'Email must be unique' })
  email: string;

  @IsEnum(UserRole, {
    message: `Invalid role. Valid options are: ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole = UserRole.USER;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
