import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, ConfirmBookingDto, AdminUpdateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        userId,
        listingId: dto.listingId,
        checkIn: new Date(dto.checkIn),
        checkOut: new Date(dto.checkOut),
        guests: dto.guests,
      },
    });
  }

  findMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { listing: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, requester: { userId: string; role: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true, payment: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (requester.role !== 'ADMIN' && booking.userId !== requester.userId) {
      throw new ForbiddenException();
    }
    return booking;
  }

  findAll(status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled', search?: string) {
    return this.prisma.booking.findMany({
      where: {
        status: status || undefined,
        ...(search
          ? {
              OR: [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { listing: { title: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: { listing: true, user: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirm(id: string, dto: ConfirmBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending') throw new BadRequestException('Only pending bookings can be confirmed');

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'confirmed', quotedPrice: dto.quotedPrice, adminNotes: dto.adminNotes },
    });
  }

  async reject(id: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending') throw new BadRequestException('Only pending bookings can be rejected');

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'rejected', adminNotes: reason },
    });
  }

  async update(id: string, requester: { userId: string; role: string }, dto: AdminUpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (requester.role !== 'ADMIN') {
      if (booking.userId !== requester.userId) throw new ForbiddenException();
      if (booking.status !== 'pending') {
        throw new BadRequestException('You can only edit a booking while it is still pending.');
      }
      // customers can't set their own price or admin notes
      dto = { ...dto, quotedPrice: undefined, adminNotes: undefined };
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        guests: dto.guests,
        quotedPrice: dto.quotedPrice,
        adminNotes: dto.adminNotes,
      },
    });
  }

  async cancel(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is already cancelled');

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
