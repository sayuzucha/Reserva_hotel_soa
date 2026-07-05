import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Room } from './room.entity';
import { RoomBlock } from './room-block.entity';
import { RedisSubscriber } from '../redis/redis.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomBlock])],
  controllers: [RoomsController],
  providers: [RoomsService, RedisSubscriber],
})
export class RoomsModule {}
