import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { BlockRoomDto } from './dto/block-room.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Verificar disponibilidad de habitación' })
  @ApiQuery({ name: 'roomId', type: Number })
  @ApiQuery({ name: 'checkIn', type: String, example: '2026-07-10' })
  @ApiQuery({ name: 'checkOut', type: String, example: '2026-07-15' })
  checkAvailability(
    @Query('roomId') roomId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    return this.service.checkAvailability(+roomId, checkIn, checkOut);
  }

  @Post('block')
  @ApiOperation({ summary: 'Bloquear habitación para una reserva' })
  blockRoom(@Body() dto: BlockRoomDto) {
    return this.service.blockRoom(dto);
  }

  @Delete('block/:reservationId')
  @ApiOperation({ summary: 'Liberar bloqueo (compensación Saga)' })
  releaseRoom(@Param('reservationId') reservationId: string) {
    return this.service.releaseRoom(+reservationId);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Crear habitaciones de ejemplo para demo' })
  seed() {
    return this.service.seed();
  }
}
