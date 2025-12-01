// src/modules/blog/blog-page.controller.ts
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
    // First try to find by slug (string)
    try {
      const bySlug = await this.blogService.getBySlug(identifier);
      if (bySlug) {
        return bySlug;
      }
    } catch (error) {
      // If not found by slug and identifier is numeric, try by ID
      if (!isNaN(Number(identifier))) {
        return this.blogService.getById(Number(identifier));
      }
      throw error; // Re-throw if it's a different error
    }

    // If we reach here, it means slug wasn't found and identifier isn't numeric
    throw new NotFoundException(`Blog with identifier "${identifier}" not found`);
  }
}
