// src/modules/pricing/entities/comparison-table.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ComparisonRow } from './comparison-row.entity';

@Entity('comparison_tables')
export class ComparisonTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  section_title: string;

  @Column({ default: 0 })
  ordering: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ComparisonRow, (row) => row.table, { cascade: true })
  rows: ComparisonRow[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
