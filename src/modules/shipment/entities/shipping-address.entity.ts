import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('shipping_addresses')
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column()
  addressLine: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column({ default: false })
  isDefault: boolean;
}
