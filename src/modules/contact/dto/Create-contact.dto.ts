import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class createContactDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;
}
