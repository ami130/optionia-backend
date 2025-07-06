import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingAddress } from './entities/shipping-address.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOrUpdateAddressDto } from './Dto/address.dto';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectRepository(ShippingAddress) private repo: Repository<ShippingAddress>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async addAddress(userId: number, dto: CreateOrUpdateAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newAddress = this.repo.create({ ...dto, user });

    // If default address, unset previous ones
    if (dto.isDefault) {
      await this.repo.update({ user: { id: userId } }, { isDefault: false });
    }

    return this.repo.save(newAddress);
  }

  async getAddresses(userId: number) {
    return this.repo.find({ where: { user: { id: userId } } });
  }

  async deleteAddress(id: number, userId: number) {
    const address = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!address) throw new NotFoundException('Address not found');
    return this.repo.remove(address);
  }
}
