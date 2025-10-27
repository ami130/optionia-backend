import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from '../uploads/uploads.service';
import { Section } from './entites/section.entity';
import { SectionItem } from './entites/section-item.entity';
import { SectionController } from './sections.controller';
import { SectionService } from './sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Section, SectionItem])],
  controllers: [SectionController],
  providers: [SectionService, UploadsService],
})
export class SectionModule {}
