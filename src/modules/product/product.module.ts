import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entities/products.entity';
import { ProductImage } from './entities/product-images.entity';
import { User } from 'src/users/entities/user.entity';
import { Tag } from '../tag/entities/tag.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, User, Tag]), CommonModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
