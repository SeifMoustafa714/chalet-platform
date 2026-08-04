import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ListingsService } from './listings.service';
import { CreateListingSchema, UpdateListingSchema } from './dto/admin-listing.dto';
import { ToggleAvailabilitySchema, CreateReviewSchema } from './dto/availability-review.dto';

@Controller('listings')
export class ListingsController {
  constructor(private service: ListingsService) {}

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('guests') guests?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.service.findAll({
      region,
      guests: guests ? Number(guests) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@CurrentUser() admin: { userId: string }, @Body() body: unknown) {
    const dto = CreateListingSchema.parse(body);
    return this.service.create(admin.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOneAdmin(@Param('id') id: string) {
    return this.service.findOneAdmin(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: unknown) {
    const dto = UpdateListingSchema.parse(body);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string) {
    return this.service.getAvailability(id);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setAvailability(@Param('id') id: string, @Body() body: unknown) {
    const dto = ToggleAvailabilitySchema.parse(body);
    return this.service.toggleAvailability(id, dto.date, dto.isBlocked);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.service.getReviews(id);
  }

  @Get(':id/reviews/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getReviewsAdmin(@Param('id') id: string) {
    return this.service.adminGetReviewsForListing(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.BROKER, Role.ADMIN)
  addReview(@Param('id') id: string, @CurrentUser() user: { userId: string }, @Body() body: unknown) {
    const dto = CreateReviewSchema.parse(body);
    return this.service.addReview(id, user.userId, dto.rating, dto.comment);
  }
}
