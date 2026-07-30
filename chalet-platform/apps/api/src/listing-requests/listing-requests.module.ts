import { Module } from '@nestjs/common';
import { ListingRequestsController } from './listing-requests.controller';
import { ListingRequestsService } from './listing-requests.service';

@Module({
  controllers: [ListingRequestsController],
  providers: [ListingRequestsService],
})
export class ListingRequestsModule {}
