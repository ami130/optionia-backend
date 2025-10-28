// src/modules/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity';
import { SharedModule } from 'src/shared-module/shared-module.module';
import { UploadsModule } from '../uploads/Upload.moudle';

@Module({
  imports: [
    SharedModule, // ✅ now PermissionGuard + RMP repo are available
    TypeOrmModule.forFeature([Blog]),
    UploadsModule, // your module-specific entities
  ],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
