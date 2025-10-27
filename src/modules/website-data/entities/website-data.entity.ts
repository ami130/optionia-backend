import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('website_data')
export class WebsiteData {
  @PrimaryGeneratedColumn()
  id: number;

  // ====== Logos & Branding ======
  @Column({ nullable: true })
  baseLogo?: string;

  @Column({ nullable: true })
  secondaryLogo?: string;

  @Column({ nullable: true })
  favicon?: string;

  @Column({ nullable: true })
  primaryColor?: string;

  @Column({ nullable: true })
  secondaryColor?: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column({ nullable: true })
  textColor?: string;

  // ====== SEO Meta Data ======
  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @Column({ type: 'json', nullable: true })
  metaKeywords?: string[];

  // ====== Owner / Business Info ======
  @Column({ nullable: true })
  ownerName?: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  supportEmail?: string;

  @Column({ nullable: true })
  hotline?: string;

  @Column({ type: 'text', nullable: true })
  businessAddress?: string;

  @Column({ type: 'text', nullable: true })
  secondaryBusinessAddress?: string;

  @Column({ nullable: true })
  facebook?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true })
  twitter?: string;

  @Column({ nullable: true })
  secondaryLink?: string;

  @Column({ nullable: true })
  bin?: string; // Business Identification Number or similar

  // ====== Timestamps ======
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
