// src/modules/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { UploadsModule } from '../uploads/Upload.moudle';
import { Page } from '../pages/entities/page.entity';
import { BlogPageController } from './blog-page.controller';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    SharedModule, // ✅ now PermissionGuard + RMP repo are available
    TypeOrmModule.forFeature([Blog, Page, Category]),
    UploadsModule, // your module-specific entities
  ],
  providers: [BlogService],
  controllers: [BlogController, BlogPageController],
})
export class BlogModule {}
