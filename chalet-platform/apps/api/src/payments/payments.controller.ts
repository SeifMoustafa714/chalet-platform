import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentSchema } from './dto/create-payment.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('bookings/:bookingId/payment')
  @Roles(Role.USER)
  submit(@Param('bookingId') bookingId: string, @Body() body: unknown) {
    const dto = CreatePaymentSchema.parse(body);
    return this.service.submit(bookingId, dto);
  }

  @Patch('payments/:id/verify')
  @Roles(Role.ADMIN)
  verify(@Param('id') id: string) {
    return this.service.verify(id);
  }
}
