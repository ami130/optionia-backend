// src/modules/website/entities/page.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'website_pages' })
export class PageEntity {
  // 🔹 Use UUID for better uniqueness and scalability
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔹 Page key remains unique (e.g., 'homePage', 'aboutPage')
  @Column({ unique: true })
  key: string;

  // 🔹 Provide default empty objects/arrays to prevent null issues
  @Column({ type: 'jsonb', default: {} })
  websiteMeta: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  sections: Record<string, any>[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  updatedBy?: string;
}
