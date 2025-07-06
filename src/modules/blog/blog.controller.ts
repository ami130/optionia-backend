/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Get,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/express-request.interface';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { Blog } from './entities/blog.entity';
import { ApiResponseInterceptor } from 'src/common/interceptors/api-response.interceptor';
import { PaginationInterceptor } from 'src/common/interceptors/pagination.interceptor';
import { commonQueryDto } from './dto/blog-query.dto';

@Controller('blog')
@UseInterceptors(ApiResponseInterceptor, PaginationInterceptor)
export class BlogController {
  constructor(
    private blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() }))
  @Roles(UserRole.ADMIN)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file: Express.Multer['File'],
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user;

    const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');

    if (!createBlogDto) {
      throw new Error('Request body is empty');
    }

    const blogData = {
      ...createBlogDto,
      imageUrl: uploadResult.secure_url,
    };

    return this.blogService.createBlog(blogData, userId?.userId);
  }

  @Get()
  async getAllBlog(@Query() query: commonQueryDto): Promise<{ data: Blog[]; count: number }> {
    return this.blogService.getAllBlog(query);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteBlog(@Param('id') id: string): Promise<any> {
    return await this.blogService.deleteBlog(+id);
  }

  @Get('/:id')
  async blogDetails(@Param('id') id: string): Promise<any> {
    const result = await this.blogService.blogDetails(+id);
    const relatedBlogs = await this.blogService.getRelatedBlogs(+id);
    return { result, relatedBlogs };
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() })) // Use FileInterceptor to handle image upload
  @Roles(UserRole.ADMIN)
  async updateBlog(
    @Param('id') id: string, // Get the blog ID from URL
    @Body() updateBlogDto: CreateBlogDto, // The updated blog data (title, description, etc.)
    @UploadedFile() file: Express.Multer['File'], // Optional: The uploaded image (if any)
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const userId = req.user; // Get the user from the request

    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');
      imageUrl = uploadResult.secure_url;
    }

    const updatedBlogData = {
      ...updateBlogDto,
      imageUrl: imageUrl ? imageUrl : undefined, // Only add imageUrl if there's a new image
    };

    return this.blogService.updateBlog(+id, updatedBlogData, userId?.userId);
  }
}
