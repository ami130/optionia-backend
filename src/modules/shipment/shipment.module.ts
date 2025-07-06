import { Module } from '@nestjs/common';
import { ShippingAddressController } from './shipment.controller';
import { ShippingAddressService } from './shipment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingAddress } from './entities/shipping-address.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddress, User])],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
})
export class ShipmentModule {}
