import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisPublisher implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.cfg.get('REDIS_HOST', 'redis'),
      port: +this.cfg.get('REDIS_PORT', '6379'),
    });
  }

  async publish(channel: string, message: object) {
    await this.client.publish(channel, JSON.stringify(message));
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
