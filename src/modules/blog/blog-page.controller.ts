// src/modules/blog/blog-page.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiResponseInterceptor } from 'src/common/interceptors/api-response.interceptor';
import { BlogFilterDto } from './dto/blog-query.dto';

@Controller('pages/blog')
@UseInterceptors(ApiResponseInterceptor)
export class BlogPageController {
  constructor(private readonly blogService: BlogService) {}

  // ✅ GET BLOG PAGE DATA (page info + blogs)
  @Get()
  async getBlogPage(@Query() filters: BlogFilterDto) {
    return this.blogService.getBlogPage(filters);
  }

  // ✅ GET SINGLE BLOG BY ID OR SLUG
  @Get(':identifier')
  async getBlogByIdOrSlug(@Param('identifier') identifier: string) {
    // Check if identifier is a number (ID) or string (slug)
    const id = parseInt(identifier);

    if (!isNaN(id)) {
      // It's a numeric ID
      return this.blogService.getById(id);
    } else {
      // It's a slug
      return this.blogService.getBySlug(identifier);
    }
  }

  // ✅ GET SINGLE BLOG BY ID
  // @Get(':id')
  // async getBlogById(@Param('id', ParseIntPipe) id: number) {
  //   return this.blogService.getById(id);
  // }

  // @Get('blogs/:id')
  // async getBlogById(@Param('id', ParseIntPipe) id: number) {
  //   return this.blogService.getById(id);
  // }
}
