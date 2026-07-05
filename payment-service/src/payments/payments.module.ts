import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './payment.entity';
import { Refund } from './refund.entity';
import { RedisSubscriber } from '../redis/redis.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Refund])],
  controllers: [PaymentsController],
  providers: [PaymentsService, RedisSubscriber],
})
export class PaymentsModule {}
