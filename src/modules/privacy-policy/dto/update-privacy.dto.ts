// src/modules/privacy-policy/dto/update-privacy.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePrivacyDto } from './create-privacy.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePrivacyDto extends PartialType(CreatePrivacyDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  pageId?: number;
}
