/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductImage } from './product-images.entity';
import { Tag } from 'src/modules/tag/entities/tag.entity';
import { Review } from 'src/modules/review/entities/review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  subtitle?: string;

  @Column('text')
  description: string;

  @Column()
  details: string;

  // ✅ Rename from `tagIds` to `tags`

  // ✅ Use these exact names:
  @Column()
  thumbnailUrl: string;

  @Column()
  thumbnailPublicId: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  UpdateAt: Date;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, eager: true })
  images: ProductImage[];
  data: any;

  @OneToMany(() => Review, (review) => review.product, { eager: true, cascade: true })
  reviews: Review[];
}
