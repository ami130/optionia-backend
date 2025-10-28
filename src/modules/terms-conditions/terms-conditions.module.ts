import { Module } from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { TermsConditionsController } from './terms-conditions.controller';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermsConditions } from './entities/terms-conditions.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([TermsConditions])],
  providers: [TermsConditionsService],
  controllers: [TermsConditionsController],
  exports: [TermsConditionsService],
})
export class TermsConditionsModule {}
