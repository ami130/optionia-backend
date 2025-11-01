// src/modules/blog/blog-page.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('pages/blog')
export class BlogPageController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getBlogPage() {
    return this.blogService.getBlogPage();
  }
}
