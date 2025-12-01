// src/modules/pricing/entities/comparison-row.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ComparisonTable } from './comparison-table.entity';

@Entity('comparison_rows')
export class ComparisonRow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ type: 'text' })
  free_value: string; // Can be string, "true", "false", or JSON

  @Column({ type: 'text' })
  pro_value: string;

  @Column({ type: 'text' })
  advanced_value: string;

  @Column({ default: 0 })
  ordering: number;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => ComparisonTable, (table) => table.rows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: ComparisonTable;

  @Column()
  table_id: number;
}
