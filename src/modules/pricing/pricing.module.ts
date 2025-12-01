// src/modules/pricing/pricing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingPlan } from './entities/pricing-plan.entity';
import { PricingFeature } from './entities/pricing-feature.entity';
import { ComparisonTable } from './entities/comparison-table.entity';
import { ComparisonRow } from './entities/comparison-row.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';

@Module({
  imports: [TypeOrmModule.forFeature([PricingPlan, PricingFeature, ComparisonTable, ComparisonRow]), SharedModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
