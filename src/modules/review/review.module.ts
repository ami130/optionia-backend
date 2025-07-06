import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/products.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product, User])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
