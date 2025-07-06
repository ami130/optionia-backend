import { Product } from 'src/modules/product/entities/products.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  comment: string;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @ManyToOne(() => Product, (product) => product.reviews, {})
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
