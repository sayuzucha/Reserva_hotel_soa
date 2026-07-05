import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Reservation, ReservationStatus } from './reservation.entity';
import { SagaService } from '../saga/saga.service';
import { SagaStepStatus } from '../saga/saga-log.entity';
import { RedisPublisher } from '../redis/redis.publisher';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  private roomServiceUrl: string;
  private paymentServiceUrl: string;

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private readonly http: HttpService,
    private readonly sagaService: SagaService,
    private readonly redisPublisher: RedisPublisher,
    private readonly cfg: ConfigService,
  ) {
    this.roomServiceUrl = cfg.get('ROOM_SERVICE_URL', 'http://room-service:3002');
    this.paymentServiceUrl = cfg.get('PAYMENT_SERVICE_URL', 'http://payment-service:3003');
  }

  // ── Crear reserva (Saga por Orquestación) ────────────────────────
  async create(dto: CreateReservationDto) {
    // Paso 0: crear reserva en PENDING
    const reservation = this.reservationRepo.create({
      guestId: dto.guestId,
      roomId: dto.roomId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      totalPrice: 0,
      status: ReservationStatus.PENDING,
    });
    await this.reservationRepo.save(reservation);

    // Paso 1: verificar disponibilidad
    let availability: any;
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.roomServiceUrl}/rooms/availability`, {
          params: { roomId: dto.roomId, checkIn: dto.checkIn, checkOut: dto.checkOut },
        }),
      );
      availability = res.data;
    } catch (e) {
      await this.failReservation(reservation, 'Room service no disponible');
    }

    if (!availability.available) {
      await this.failReservation(reservation, 'Habitación no disponible para las fechas solicitadas');
    }

    reservation.totalPrice = availability.pricePerNight;
    await this.reservationRepo.save(reservation);

    // Paso 2: bloquear habitación
    try {
      await firstValueFrom(
        this.http.post(`${this.roomServiceUrl}/rooms/block`, {
          roomId: dto.roomId,
          reservationId: reservation.id,
          checkIn: dto.checkIn,
          checkOut: dto.checkOut,
        }),
      );
      await this.sagaService.log(reservation.id, 'BLOCK_ROOM', SagaStepStatus.EXECUTED);
    } catch (e) {
      await this.failReservation(reservation, 'Error al bloquear habitación');
    }

    // Paso 3: procesar pago
    try {
      await firstValueFrom(
        this.http.post(`${this.paymentServiceUrl}/payments/charge`, {
          reservationId: reservation.id,
          guestId: dto.guestId,
          amount: reservation.totalPrice,
          method: 'CREDIT_CARD',
        }),
      );
      await this.sagaService.log(reservation.id, 'CHARGE', SagaStepStatus.EXECUTED);
    } catch (e) {
      // Compensación: liberar habitación
      await this.compensateRoom(reservation);
      await this.failReservation(reservation, 'Error al procesar el pago — reserva cancelada');
    }

    // Paso 4: confirmar
    reservation.status = ReservationStatus.CONFIRMED;
    await this.reservationRepo.save(reservation);

    // Evento Redis: reservation.confirmed
    await this.redisPublisher.publish('reservation.confirmed', {
      reservationId: reservation.id,
      guestId: dto.guestId,
      roomId: dto.roomId,
      total: reservation.totalPrice,
    });

    return reservation;
  }

  async findOne(id: number) {
    const r = await this.reservationRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Reserva ${id} no encontrada`);
    return r;
  }

  async cancel(id: number) {
    const reservation = await this.findOne(id);

    // Compensar habitación
    await this.compensateRoom(reservation);

    // Reembolso
    try {
      await firstValueFrom(
        this.http.post(`${this.paymentServiceUrl}/payments/refund`, {
          reservationId: id,
          reason: 'Cancelación por cliente',
        }),
      );
      await this.sagaService.log(id, 'REFUND', SagaStepStatus.EXECUTED);
    } catch (_) {}

    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationRepo.save(reservation);

    await this.redisPublisher.publish('reservation.failed', { reservationId: id });

    return { message: `Reserva ${id} cancelada`, compensated: true };
  }

  // ── Helpers internos ─────────────────────────────────────────────
  private async compensateRoom(reservation: Reservation) {
    try {
      await firstValueFrom(
        this.http.delete(`${this.roomServiceUrl}/rooms/block/${reservation.id}`),
      );
      await this.sagaService.log(reservation.id, 'BLOCK_ROOM', SagaStepStatus.COMPENSATED);
    } catch (_) {}
  }

  private async failReservation(reservation: Reservation, message: string): Promise<never> {
    reservation.status = ReservationStatus.FAILED;
    await this.reservationRepo.save(reservation);
    await this.redisPublisher.publish('reservation.failed', { reservationId: reservation.id, reason: message });
    throw new UnprocessableEntityException(message);
  }
}
