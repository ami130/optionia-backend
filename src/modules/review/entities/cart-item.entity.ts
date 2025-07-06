import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/modules/product/entities/products.entity';

@Entity('cart-item')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ default: 1 })
  quantity: number;
}
