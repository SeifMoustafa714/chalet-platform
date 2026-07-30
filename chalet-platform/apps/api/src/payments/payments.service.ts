import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async submit(bookingId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Payment can only be submitted for a confirmed booking');
    }

    return this.prisma.payment.create({
      data: { bookingId, ...dto },
    });
  }

  async verify(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'verified', verifiedAt: new Date() },
    });
  }
}
