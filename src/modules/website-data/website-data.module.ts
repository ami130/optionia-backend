// src/modules/website-data/website-data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteDataService } from './website-data.service';
import { WebsiteDataController } from './website-data.controller';
import { WebsiteData } from './entities/website-data.entity';
import { UploadsModule } from '../uploads/Upload.moudle';

@Module({
  imports: [TypeOrmModule.forFeature([WebsiteData]), UploadsModule],
  providers: [WebsiteDataService],
  controllers: [WebsiteDataController],
  exports: [WebsiteDataService],
})
export class WebsiteDataModule {}
