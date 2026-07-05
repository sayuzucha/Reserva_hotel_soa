import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubscriber.name);
  private client: Redis;

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.cfg.get('REDIS_HOST', 'redis'),
      port: +this.cfg.get('REDIS_PORT', '6379'),
    });

    this.client.subscribe('reservation.failed', (err) => {
      if (err) this.logger.error('Error suscribiéndose a Redis', err);
      else this.logger.log('Suscrito a canal: reservation.failed');
    });

    this.client.on('message', (channel, message) => {
      if (channel === 'reservation.failed') {
        const data = JSON.parse(message);
        this.logger.log(`[reservation.failed] reservationId=${data.reservationId} — habitación ya liberada vía REST o se libera aquí.`);
        // La compensación principal se hace vía REST desde reservation-service.
        // Este subscriber es notificación adicional.
      }
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
