// src/modules/partners/partners.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { PartnerCategory } from '../partner-category/entities/partner-category.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { PartnersController } from './partner.controller';
import { PartnersService } from './partner.service';
import { UploadsService } from 'src/modules/uploads/uploads.service';
import { Page } from 'src/modules/pages/entities/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, PartnerCategory, Page]), SharedModule],
  controllers: [PartnersController],
  providers: [PartnersService, UploadsService],
  exports: [PartnersService],
})
export class PartnersModule {}
