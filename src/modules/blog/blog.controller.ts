import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UploadsService } from '../uploads/uploads.service';

@UseModule('blog')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly service: BlogService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ✅ CREATE
  @Permissions('create')
  @Post()
  @UseInterceptors(
    function (req, res, next) {
      return this.uploadInterceptor(req, res, next);
    }.bind(this),
  )
  async create(@Body() dto: CreateBlogDto, @Req() req: any) {
    if (!dto.pageId) throw new BadRequestException('pageId is required');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');
    return this.service.create(dto, req.user);
  }

  // ✅ FIND ALL
  @Permissions('view')
  @Get()
  async findAll() {
    return this.service.getAll();
  }

  // ✅ FIND ONE
  @Permissions('view')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  // ✅ UPDATE
  @Permissions('update')
  @Put(':id')
  @UseInterceptors(
    function (req, res, next) {
      return this.uploadInterceptor(req, res, next);
    }.bind(this),
  )
  async update(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() data: UpdateBlogDto) {
    return this.service.update(+id, data);
  }

  // ✅ DELETE
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

// import {
//   Controller,
//   Post,
//   Patch,
//   UploadedFiles,
//   Body,
//   Req,
//   UseGuards,
//   UseInterceptors,
//   Param,
//   BadRequestException,
//   Get,
//   Delete,
// } from '@nestjs/common';
// import { BlogService } from './blog.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { PermissionGuard } from 'src/auth/guards/permission.guard';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { Permissions } from 'src/permissions/decorators/permissions.decorator';
// import { CreateBlogDto } from './dto/create-blog.dto';
// import { UpdateBlogDto } from './dto/update-blog.dto';
// import { UploadsService } from '../uploads/uploads.service';

// @Controller('blogs')
// export class BlogController {
//   private readonly uploadInterceptor;

//   constructor(
//     private readonly blogService: BlogService,
//     // private readonly uploadsService: UploadsService,
//   ) {
//     // ✅ initialize interceptor **inside constructor**, not in decorator
//     // this.uploadInterceptor = createUploadInterceptor(this.uploadsService);
//   }

//   @Post()
//   // @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   // @Roles('admin', 'editor')
//   // @Permissions('create_blog')
//   // @UseInterceptors(
//   //   function (req, res, next) {
//   //     return this.uploadInterceptor(req, res, next);
//   //   }.bind(this),
//   // ) // ✅ bind 'this' to access uploadInterceptor
//   async create(@Body() dto: CreateBlogDto, @Req() req: any) {
//     if (!dto.pageId) throw new BadRequestException('pageId is required');
//     if (!dto.categoryId) throw new BadRequestException('categoryId is required');
//     return this.blogService.create(dto, req.user);
//   }

//   @Patch(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Roles('admin', 'editor')
//   @Permissions('update_blog')
//   // @UseInterceptors(
//   //   function (req, res, next) {
//   //     return this.uploadInterceptor(req, res, next);
//   //   }.bind(this),
//   // )
//   async update(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() data: UpdateBlogDto) {
//     // this.uploadsService.mapFilesToData(files, data, ['image']);
//     return this.blogService.update(+id, data);
//   }

//   @Get()
//   async getAll() {
//     return this.blogService.getAll();
//   }

//   @Get(':id')
//   async get(@Param('id') id: string) {
//     return this.blogService.getById(+id);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Roles('admin')
//   @Permissions('delete_blog')
//   async delete(@Param('id') id: string) {
//     return this.blogService.delete(+id);
//   }
// }

// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   Body,
//   Controller,
//   Post,
//   UseGuards,
//   Req,
//   UseInterceptors,
//   UploadedFile,
//   Get,
//   Delete,
//   Param,
//   Put,
//   Query,
// } from '@nestjs/common';
// import { BlogService } from './blog.service';
// import { CreateBlogDto } from './dto/create-blog.dto';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { UserRole } from 'src/users/enum/userRole.enum';
// import { RoleGuard } from 'src/auth/guards/roles.guard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { AuthenticatedRequest } from 'src/types/express-request.interface';
// import { CloudinaryService } from 'src/common/services/cloudinary.service';
// import { FileInterceptor } from '@nestjs/platform-express';
// import multer from 'multer';
// import { Blog } from './entities/blog.entity';
// import { ApiResponseInterceptor } from 'src/common/interceptors/api-response.interceptor';
// import { PaginationInterceptor } from 'src/common/interceptors/pagination.interceptor';
// import { commonQueryDto } from './dto/blog-query.dto';

// import { Express } from 'express';
// import 'multer'; // This import extends the Express namespace with Multer types

// @Controller('blog')
// @UseInterceptors(ApiResponseInterceptor, PaginationInterceptor)
// export class BlogController {
//   constructor(
//     private blogService: BlogService,
//     private readonly cloudinaryService: CloudinaryService,
//   ) {}

//   @Post()
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() }))
//   @Roles(UserRole.ADMIN)
//   async createBlog(
//     @Body() createBlogDto: CreateBlogDto,
//     @UploadedFile() file: Express.Multer.File,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     const userId = req.user;

//     const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');

//     if (!createBlogDto) {
//       throw new Error('Request body is empty');
//     }

//     const blogData = {
//       ...createBlogDto,
//       imageUrl: uploadResult.secure_url,
//     };

//     return this.blogService.createBlog(blogData, userId?.userId);
//   }

//   @Get()
//   async getAllBlog(@Query() query: commonQueryDto): Promise<{ data: Blog[]; count: number }> {
//     return this.blogService.getAllBlog(query);
//   }

//   @Delete('/:id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles(UserRole.ADMIN)
//   async deleteBlog(@Param('id') id: string): Promise<any> {
//     return await this.blogService.deleteBlog(+id);
//   }

//   @Get('/:id')
//   async blogDetails(@Param('id') id: string): Promise<any> {
//     const result = await this.blogService.blogDetails(+id);
//     const relatedBlogs = await this.blogService.getRelatedBlogs(+id);
//     return { result, relatedBlogs };
//   }

//   @Put('/:id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() })) // Use FileInterceptor to handle image upload
//   @Roles(UserRole.ADMIN)
//   async updateBlog(
//     @Param('id') id: string, // Get the blog ID from URL
//     @Body() updateBlogDto: CreateBlogDto, // The updated blog data (title, description, etc.)

//     @UploadedFile() file: Express.Multer.File, // Optional: The uploaded image (if any)
//     @Req() req: AuthenticatedRequest,
//   ): Promise<any> {
//     const userId = req.user; // Get the user from the request

//     let imageUrl: string | undefined;

//     if (file) {
//       const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');
//       imageUrl = uploadResult.secure_url;
//     }

//     const updatedBlogData = {
//       ...updateBlogDto,
//       imageUrl: imageUrl ? imageUrl : undefined, // Only add imageUrl if there's a new image
//     };

//     return this.blogService.updateBlog(+id, updatedBlogData, userId?.userId);
//   }
// }
