import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingSchema, ConfirmBookingSchema } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private service: BookingsService) {}

  @Post()
  @Roles(Role.USER)
  create(@CurrentUser() user: { userId: string }, @Body() body: unknown) {
    const dto = CreateBookingSchema.parse(body);
    return this.service.create(user.userId, dto);
  }

  @Get('mine')
  @Roles(Role.USER)
  findMine(@CurrentUser() user: { userId: string }) {
    return this.service.findMine(user.userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('status') status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled') {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/confirm')
  @Roles(Role.ADMIN)
  confirm(@Param('id') id: string, @Body() body: unknown) {
    const dto = ConfirmBookingSchema.parse(body);
    return this.service.confirm(id, dto);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.reject(id, reason);
  }
}
