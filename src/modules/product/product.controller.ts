/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { AuthenticatedRequest } from 'src/types/express-request.interface';
import { ProductService } from './product.service';
import { commonQueryDto } from '../blog/dto/blog-query.dto';
import { Product } from './entities/products.entity';

import { Express } from 'express';
import 'multer'; // This import extends the Express namespace with Multer types

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 5 },
      ],
      { storage: multer.memoryStorage() },
    ),
  )
  async createProduct(
    // 1️⃣ Get files first
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; images?: Express.Multer.File[] },

    // 2️⃣ Then body
    @Body() createProductDto: any,

    // 3️⃣ Then request
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    const thumbnail = files.thumbnail?.[0];
    const images = files.images || [];

    if (!thumbnail) {
      throw new BadRequestException('Thumbnail is required');
    }
    if (images.length === 0) {
      throw new BadRequestException('At least one product image is required');
    }
    if (images.length > 5) {
      throw new BadRequestException('Maximum 5 product images allowed');
    }

    return this.productService.createProduct(createProductDto, thumbnail, images, userId);
  }

  @Get()
  async getAllProducts(@Query() query: commonQueryDto): Promise<{ data: Product[]; count: number }> {
    return this.productService.getAllProducts(query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Param('id') id: string): Promise<any> {
    return this.productService.deleteProduct(+id);
  }

  @Get(':id')
  async getProductDetails(@Param('id') id: string): Promise<any> {
    const relatedProducts = await this.productService.getRelatedProducts(+id);
    const result = await this.productService.getProductDetails(+id);
    return { result, relatedProducts };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 5 },
      ],
      { storage: multer.memoryStorage() },
    ),
  )
  async updateProduct(
    @Query('id') id: number,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[]; images?: Express.Multer.File[] },
    @Body() updateProductDto: any,
  ) {
    const thumbnail = files.thumbnail?.[0];
    const images = files.images || [];

    return this.productService.updateProduct(+id, updateProductDto, thumbnail, images);
  }
}
