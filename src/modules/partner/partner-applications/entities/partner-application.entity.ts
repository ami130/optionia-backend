// src/modules/partner-applications/entities/partner-application.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('partner_applications')
export class PartnerApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ length: 500, nullable: true })
  companyWebsite: string;

  @Column({ length: 100, nullable: true })
  partnerType: string;

  @Column('text', { nullable: true })
  message: string;

  @Column({ default: false })
  contacted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
