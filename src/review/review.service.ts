import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { ItemService } from 'src/item/item.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly repo: Repository<Review>,
    private readonly itemService: ItemService,
    private readonly usersService: UsersService,
  ) {}

  // Create a review
  async createReview(
    userId: number,
    itemId: number,
    comment: string,
    rating: number,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const item = await this.itemService.findOne(itemId);
    if (!item) throw new NotFoundException('Item not found');

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    const review = this.repo.create({
      comment,
      rating,
      user,
      item,
    });

    return this.repo.save(review);
  }
}
