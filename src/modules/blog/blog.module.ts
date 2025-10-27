// src/modules/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity';
import { User } from 'src/users/entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { UploadsModule } from '../uploads/Upload.moudle';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User]), CommonModule, UploadsModule],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
