import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { TagsController } from './tag.controller';
import { TagsService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag]), SharedModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagModule {}
