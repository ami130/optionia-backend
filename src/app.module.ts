/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { TagModule } from './modules/tag/tag.module';
import { ProductModule } from './modules/product/product.module';
import { ReviewModule } from './modules/review/review.module';
import { CartModule } from './modules/cart/cart.module';
import { ShipmentModule } from './modules/shipment/shipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    CommonModule,
    BlogModule,
    ContactModule,
    TagModule,
    ProductModule,
    ReviewModule,
    CartModule,
    ShipmentModule,
  ],
  // providers: [IsUniqueConstraint],
  // controllers: [UsersController],
  // providers: [UsersService],
})
export class AppModule {}
