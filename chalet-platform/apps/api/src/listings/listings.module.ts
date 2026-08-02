import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ReviewsController } from './reviews.controller';
import { ListingsService } from './listings.service';

@Module({
  controllers: [ListingsController, ReviewsController],
  providers: [ListingsService],
})
export class ListingsModule {}
