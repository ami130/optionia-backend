import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // @OneToMany(() => Permission, (permission) => permission.module)
  // permissions: Permission[];
}
