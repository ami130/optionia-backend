// src/modules/partner-applications/partner-applications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerApplicationsController } from './partner-applications.controller';
import { PartnerApplicationsService } from './partner-applications.service';
import { PartnerApplication } from './entities/partner-application.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerApplication]), SharedModule],
  controllers: [PartnerApplicationsController],
  providers: [PartnerApplicationsService],
  exports: [PartnerApplicationsService],
})
export class PartnerApplicationsModule {}
