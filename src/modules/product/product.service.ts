/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { ProductImage } from './entities/product-images.entity';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { CreateProductDto } from './Dto/product.dto';
import { User } from 'src/users/entities/user.entity';
import { Tag } from '../tag/entities/tag.entity';
import { commonQueryDto } from '../blog/dto/blog-query.dto';

import { Express } from 'express';
import 'multer'; // This import extends the Express namespace with Multer types
import { slugify } from 'src/common/config/slugify';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly cloudinaryService: CloudinaryService, // ✅ your uploader
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    thumbnail: Express.Multer.File,
    images: Express.Multer.File[],
    userId: number,
  ): Promise<Product> {
    try {
      // ✅ Step 1: Check for duplicate title
      const existingProduct = await this.productRepository.findOne({
        where: { title: createProductDto.title },
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this title already exists');
      }

      // ✅ Step 2: Upload thumbnail
      const thumbnailUpload = await this.cloudinaryService.uploadImage(thumbnail, 'products/thumbnail');

      // ✅ Step 3: Upload additional images
      const imageUploads = await Promise.all(
        images.map((file) => this.cloudinaryService.uploadImage(file, 'products/images')),
      );

      // ✅ Step 4: Check user
      const author = await this.userRepository.findOne({ where: { id: userId } });
      if (!author) throw new NotFoundException('Author user not found');

      // ✅ Step 5: Validate and fetch tags
      let tagIds: number[] = [];
      try {
        tagIds =
          typeof createProductDto.tagIds === 'string' ? JSON.parse(createProductDto.tagIds) : createProductDto.tagIds;

        if (!Array.isArray(tagIds)) throw new Error();

        tagIds = tagIds.map((id) => Number(id)).filter((id) => !isNaN(id));
      } catch (error) {
        throw new BadRequestException('Invalid tagIds format. Must be a JSON array of numbers.');
      }

      const tagEntities = await this.tagRepository.findBy({ id: In(tagIds) });
      if (tagEntities.length !== tagIds.length) {
        throw new NotFoundException('Some tag IDs are invalid');
      }

      // ✅ Step 6: Create the product
      const product = this.productRepository.create({
        ...createProductDto,
        slug: slugify(createProductDto.title),
        thumbnailUrl: thumbnailUpload.secure_url,
        thumbnailPublicId: thumbnailUpload.public_id,
      });

      const savedProduct = await this.productRepository.save(product);

      // ✅ Step 7: Save product images
      const productImages = imageUploads.map((upload) =>
        this.productImageRepository.create({
          url: upload.secure_url,
          publicId: upload.public_id,
          product: savedProduct,
        }),
      );
      await this.productImageRepository.save(productImages);

      return savedProduct;
    } catch (error) {
      console.error('🔥 CREATE PRODUCT ERROR:', error);
      throw new BadRequestException(error.message || 'Failed to create product');
    }
  }

  async getAllProducts(query: commonQueryDto): Promise<{ data: Product[]; count: number }> {
    const { page = 1, limit = 10, search, authorId, order = 'DESC', sortBy = 'createdAt' } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (search) {
      // ❌ can't use LIKE here — only exact matches
      whereConditions.title = search;
    }

    // if (authorId) {
    //   whereConditions.author = { id: authorId };
    // }

    const [data, count] = await this.productRepository.findAndCount({
      where: whereConditions,
      take: limit,
      skip,
      order: {
        [sortBy]: order,
      },
      relations: ['tags'], // if you want to include related entities
    });

    return { data, count };
  }

  async deleteProduct(id: number): Promise<{ deleted: boolean; id: number }> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return { deleted: true, id };
  }

  async getProductDetails(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['tags', 'images', 'reviews', 'reviews.user'], // Include related entities if needed
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async getRelatedProducts(id: number): Promise<Product[]> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const relatedProducts = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.tags', 'tag')
      .where('tag.id IN (:...tagIds)', {})
      .andWhere('product.id != :id', { id })
      .leftJoinAndSelect('product.tags', 'tags') // preload tags if needed
      .take(5)
      .getMany();

    return relatedProducts;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug: slug },
      relations: ['tags', 'images'], // Include related entities if needed
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
    thumbnail?: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['tags', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // ✅ Check if title is changed and generate new slug
    if (updateProductDto.title && updateProductDto.title !== product.title) {
      const titleExists = await this.productRepository.findOne({
        where: { title: updateProductDto.title, id: Not(id) },
      });
      if (titleExists) {
        throw new BadRequestException('Another product with this title already exists');
      }
      product.title = updateProductDto.title;
      product.slug = slugify(updateProductDto.title);
    }

    // ✅ Update description, price, etc.
    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }

    // ✅ Handle tag updates
    if (updateProductDto.tagIds) {
      let tagIds: number[] = [];
      try {
        tagIds =
          typeof updateProductDto.tagIds === 'string' ? JSON.parse(updateProductDto.tagIds) : updateProductDto.tagIds;

        if (!Array.isArray(tagIds)) throw new Error();

        tagIds = tagIds.map((id) => Number(id)).filter((id) => !isNaN(id));
      } catch {
        throw new BadRequestException('Invalid tagIds format');
      }

      const tagEntities = await this.tagRepository.findBy({ id: In(tagIds) });
      if (tagEntities.length !== tagIds.length) {
        throw new NotFoundException('Some tag IDs are invalid');
      }
    }

    // ✅ Update thumbnail if provided
    if (thumbnail) {
      if (product.thumbnailPublicId) {
        await this.cloudinaryService.deleteImage(product.thumbnailPublicId);
      }
      const uploaded = await this.cloudinaryService.uploadImage(thumbnail, 'products/thumbnail');
      product.thumbnailUrl = uploaded.secure_url;
      product.thumbnailPublicId = uploaded.public_id;
    }

    // ✅ Replace product images if new ones provided
    if (images && images.length > 0) {
      // Delete old images from Cloudinary and DB
      for (const image of product.images) {
        await this.cloudinaryService.deleteImage(image.publicId);
      }
      await this.productImageRepository.delete({ product: { id } });

      const imageUploads = await Promise.all(
        images.map((file) => this.cloudinaryService.uploadImage(file, 'products/images')),
      );

      const productImages = imageUploads.map((upload) =>
        this.productImageRepository.create({
          url: upload.secure_url,
          publicId: upload.public_id,
          product,
        }),
      );
      await this.productImageRepository.save(productImages);
    }

    const updated = await this.productRepository.save(product);
    return updated;
  }
}
