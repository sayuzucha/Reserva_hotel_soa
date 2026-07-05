import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Refund } from './refund.entity';
import { ChargeDto, RefundDto } from './dto/charge.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Refund) private readonly refundRepo: Repository<Refund>,
  ) {}

  async charge(dto: ChargeDto) {
    const existing = await this.paymentRepo.findOne({ where: { reservationId: dto.reservationId } });
    if (existing) throw new ConflictException('Ya existe un pago para esta reserva');

    const payment = this.paymentRepo.create({
      reservationId: dto.reservationId,
      guestId: dto.guestId,
      amount: dto.amount,
      method: dto.method,
      status: 'APPROVED',
      chargedAt: new Date(),
    });
    await this.paymentRepo.save(payment);
    return { id: payment.id, status: payment.status, amount: payment.amount, reservationId: payment.reservationId };
  }

  async refund(dto: RefundDto) {
    const payment = await this.paymentRepo.findOne({ where: { reservationId: dto.reservationId } });
    if (!payment) return { refunded: false, amount: 0 };

    payment.status = 'REFUNDED';
    payment.refundedAt = new Date();
    await this.paymentRepo.save(payment);

    const refund = this.refundRepo.create({
      paymentId: payment.id,
      reason: dto.reason,
      amount: payment.amount,
    });
    await this.refundRepo.save(refund);

    return { refunded: true, amount: payment.amount };
  }

  // Confirmación al recibir evento Redis reservation.confirmed
  async confirmByEvent(reservationId: number) {
    const payment = await this.paymentRepo.findOne({ where: { reservationId } });
    if (payment && payment.status === 'PENDING') {
      payment.status = 'APPROVED';
      payment.chargedAt = new Date();
      await this.paymentRepo.save(payment);
    }
  }
}
