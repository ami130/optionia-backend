// src/modules/pricing/pricing.controller.ts
import { Controller, Get, Put, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import { UpdatePricingDataDto } from './dto/pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // ✅ GET PRICING DATA (Public)
  @Get()
  async getPricingData() {
    return this.pricingService.getPricingData();
  }

  // ✅ UPDATE PRICING DATA (Admin)
  @UseModule('pricing')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Put()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) // Add this
  async updatePricingData(@Body() dto: UpdatePricingDataDto) {
    return this.pricingService.updatePricingData(dto);
  }
}
