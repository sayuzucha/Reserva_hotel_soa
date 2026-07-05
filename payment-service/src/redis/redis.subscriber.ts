import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class RedisSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubscriber.name);
  private client: Redis;

  constructor(
    private readonly cfg: ConfigService,
    private readonly paymentsService: PaymentsService,
  ) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.cfg.get('REDIS_HOST', 'redis'),
      port: +this.cfg.get('REDIS_PORT', '6379'),
    });

    this.client.subscribe('reservation.confirmed', (err) => {
      if (err) this.logger.error('Error suscribiéndose', err);
      else this.logger.log('Suscrito a canal: reservation.confirmed');
    });

    this.client.on('message', async (channel, message) => {
      if (channel === 'reservation.confirmed') {
        const data = JSON.parse(message);
        this.logger.log(`[reservation.confirmed] reservationId=${data.reservationId} — confirmando transacción`);
        await this.paymentsService.confirmByEvent(data.reservationId);
      }
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
