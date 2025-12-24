import {
  Controller,
  Post,
  Param,
  UseGuards,
  Body,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  createReview(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: { comment: string; rating: number },
    @Req() req: any,
  ) {
    const userId = (req.user as any).id;
    return this.reviewService.createReview(
      userId,
      itemId,
      body.comment,
      body.rating,
    );
  }
}

//fix the any req type by adding current user interface
