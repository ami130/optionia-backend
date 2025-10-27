import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../review/entities/cart.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/products.entity';
import { CartItem } from '../review/entities/cart-item.entity';
import { User } from 'src/users/entities/user.entity';
import { AddToCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async addToCart(userId: number, dto: AddToCartDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepository.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.cartRepository.findOne({
      where: {},
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.id === dto.productId);

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        product,
        quantity: dto.quantity,
        cart,
      });
      cart.items.push(newItem);
      await this.cartItemRepository.save(newItem);
    }
  }

  async getCart(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: {},
      relations: ['items', 'items.product'],
    });
    if (!cart) throw new NotFoundException('Cart not found');

    return cart;
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: {},
      relations: ['items'],
    });

    if (!cart) return;

    await this.cartItemRepository.remove(cart.items);
    await this.cartRepository.remove(cart);
  }

  async removeCartItem(userId: number, cartItemId: number) {
    const cart = await this.cartRepository.findOne({
      where: {},
      relations: ['items', 'items.product'],
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const itemToRemove = cart.items.find((item) => item.id === cartItemId);
    if (!itemToRemove) throw new NotFoundException('Cart item not found');

    cart.items = cart.items.filter((item) => item.id !== cartItemId);

    await this.cartItemRepository.remove(itemToRemove);
    await this.cartItemRepository.save(cart);

    return { message: 'Item removed from cart', cart };
  }
}
