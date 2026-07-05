import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservation.entity';
import { SagaLog } from '../saga/saga-log.entity';
import { SagaService } from '../saga/saga.service';
import { RedisPublisher } from '../redis/redis.publisher';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, SagaLog]), HttpModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, SagaService, RedisPublisher],
})
export class ReservationsModule {}
