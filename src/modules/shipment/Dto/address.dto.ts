import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateOrUpdateAddressDto {
  @IsNotEmpty() fullName: string;
  @IsNotEmpty() phoneNumber: string;
  @IsNotEmpty() addressLine: string;
  @IsNotEmpty() city: string;
  @IsNotEmpty() postalCode: string;
  @IsNotEmpty() country: string;

  @IsOptional() @IsBoolean() isDefault?: boolean;
}
