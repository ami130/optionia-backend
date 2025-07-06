import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthenticatedRequest } from 'src/types/express-request.interface';
import { AddToCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Req() req: AuthenticatedRequest, @Body() dto: AddToCartDto): Promise<any> {
    const userId = req.user.userId;
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  async getCart(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.userId;
    return this.cartService.getCart(userId);
  }

  @Delete()
  async clearCart(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.userId;
    return this.cartService.clearCart(userId);
  }

  @Delete('item/:id')
  async removeCartItem(@Param('id') itemId: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.cartService.removeCartItem(userId, +itemId);
  }
}
