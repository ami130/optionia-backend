// src/modules/partner-categories/partner-categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCategory } from './entities/partner-category.entity';
import { PartnerCategoriesController } from './partner-category.controller';
import { PartnerCategoriesService } from './partner-category.service';
import { SharedModule } from 'src/shared-module/shared-module.module';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerCategory]), SharedModule],
  controllers: [PartnerCategoriesController],
  providers: [PartnerCategoriesService],
  exports: [PartnerCategoriesService],
})
export class PartnerCategoriesModule {}
