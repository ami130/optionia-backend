// src/modules/privacy-policy/privacy-policy.module.ts
import { Module } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { Page } from 'src/modules/pages/entities/page.entity';

@Module({
  imports: [
    SharedModule, 
    TypeOrmModule.forFeature([PrivacyPolicy, Page])
  ],
  providers: [PrivacyPolicyService],
  controllers: [PrivacyPolicyController],
  exports: [PrivacyPolicyService],
})
export class PrivacyPolicyModule {}