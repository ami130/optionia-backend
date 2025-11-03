// src/modules/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { UploadsModule } from '../uploads/Upload.moudle';
import { Page } from '../pages/entities/page.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tag/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import { UploadsService } from '../uploads/uploads.service';
import { BlogPageController } from './blog-page.controller';

@Module({
  imports: [
    SharedModule, // ✅ now PermissionGuard + RMP repo are available
    TypeOrmModule.forFeature([Blog, Page, Category, Tag, User]),
    UploadsModule, // your module-specific entities
  ],
  controllers: [BlogController, BlogPageController], // <-- only controllers here
  providers: [BlogService, UploadsService], // <-- services go here
  exports: [BlogService],
})
export class BlogModule {}
