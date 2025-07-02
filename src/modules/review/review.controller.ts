// src/modules/review/review.controller.ts
import { Body, Controller, Post, Param, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReviewService } from './review.service';
import { AuthenticatedRequest } from 'src/types/express-request.interface';
import { CreateReviewDto } from './dto/review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  async createReview(
    @Param('productId') productId: number,
    @Body() dto: CreateReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.reviewService.createReview(dto, userId, productId);
  }

  @Get('product/:productId')
  async getReviews(@Param('productId') productId: number) {
    return this.reviewService.getReviewsByProduct(productId);
  }
}
