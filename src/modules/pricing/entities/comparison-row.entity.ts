import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ComparisonTable } from './comparison-table.entity';

@Entity('comparison_rows')
export class ComparisonRow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ type: 'text' })
  free_value: string;

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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}