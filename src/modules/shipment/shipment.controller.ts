import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/express-request.interface';
import { ShippingAddressService } from './shipment.service';
import { CreateOrUpdateAddressDto } from './Dto/address.dto';

@UseGuards(JwtAuthGuard)
@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly addressService: ShippingAddressService) {}

  @Post()
  addAddress(@Body() dto: CreateOrUpdateAddressDto, @Req() req: AuthenticatedRequest) {
    return this.addressService.addAddress(req.user.userId, dto);
  }

  @Get()
  getAddresses(@Req() req: AuthenticatedRequest) {
    return this.addressService.getAddresses(req.user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    return this.addressService.deleteAddress(id, req.user.userId);
  }
}
