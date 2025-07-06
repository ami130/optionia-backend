import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.carts)
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[]; // Renamed from items to item for singular form
}
