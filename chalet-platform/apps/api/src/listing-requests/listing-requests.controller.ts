import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ListingRequestsService } from './listing-requests.service';
import { CreateListingRequestSchema } from './dto/create-listing-request.dto';
import { ReviewEditSchema, RejectSchema } from './dto/review-listing-request.dto';

@Controller('listing-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListingRequestsController {
  constructor(private service: ListingRequestsService) {}

  // Users and brokers submit new requests. Never goes live directly.
  @Post()
  @Roles(Role.USER, Role.BROKER, Role.ADMIN)
  create(@CurrentUser() user: { userId: string }, @Body() body: unknown) {
    const dto = CreateListingRequestSchema.parse(body);
    return this.service.create(user.userId, dto);
  }

  @Get('mine')
  @Roles(Role.USER, Role.BROKER, Role.ADMIN)
  findMine(@CurrentUser() user: { userId: string }) {
    return this.service.findMine(user.userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('status') status?: 'pending_review' | 'approved' | 'rejected') {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: unknown) {
    const dto = ReviewEditSchema.parse(body);
    return this.service.update(id, dto);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() admin: { userId: string }) {
    return this.service.approve(id, admin.userId);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() admin: { userId: string }, @Body() body: unknown) {
    const { reason } = RejectSchema.parse(body);
    return this.service.reject(id, admin.userId, reason);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() admin: { userId: string }, @Body() body: unknown) {
    const { reason } = RejectSchema.parse(body);
    return this.service.reject(id, admin.userId, reason);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
