import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../review/entities/cart.entity';
import { CartItem } from '../review/entities/cart-item.entity';
import { Product } from '../product/entities/products.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product, User])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
