import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomBlock } from './room-block.entity';
import { BlockRoomDto } from './dto/block-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomBlock) private readonly blockRepo: Repository<RoomBlock>,
  ) {}

  async checkAvailability(roomId: number, checkIn: string, checkOut: string) {
    const room = await this.roomRepo.findOne({ where: { id: roomId, isActive: 1 } });
    if (!room) throw new NotFoundException(`Habitación ${roomId} no encontrada`);

    const conflict = await this.blockRepo
      .createQueryBuilder('b')
      .where('b.room_id = :roomId', { roomId })
      .andWhere('b.check_in < :checkOut', { checkOut })
      .andWhere('b.check_out > :checkIn', { checkIn })
      .getOne();

    return {
      available: !conflict,
      pricePerNight: room.pricePerNight,
      roomId: room.id,
      type: room.type,
    };
  }

  async blockRoom(dto: BlockRoomDto) {
    const existing = await this.blockRepo.findOne({ where: { reservationId: dto.reservationId } });
    if (existing) throw new ConflictException('Ya existe un bloqueo para esta reserva');

    const block = this.blockRepo.create({
      roomId: dto.roomId,
      reservationId: dto.reservationId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
    });
    await this.blockRepo.save(block);
    return { blocked: true, roomId: dto.roomId };
  }

  async releaseRoom(reservationId: number) {
    const block = await this.blockRepo.findOne({ where: { reservationId } });
    if (!block) return { released: false };
    await this.blockRepo.remove(block);
    return { released: true };
  }

  // Seed data para demo
  async seed() {
    const count = await this.roomRepo.count();
    if (count > 0) return { message: 'Ya existe seed data' };

    const rooms = [
      { name: 'Habitación 101', type: 'SINGLE', capacity: 1, pricePerNight: 800, isActive: 1 },
      { name: 'Habitación 201', type: 'DOUBLE', capacity: 2, pricePerNight: 1400, isActive: 1 },
      { name: 'Suite Presidencial', type: 'SUITE', capacity: 4, pricePerNight: 3500, isActive: 1 },
      { name: 'Salón Eventos A', type: 'EVENT_HALL', capacity: 100, pricePerNight: 8000, isActive: 1 },
    ];
    await this.roomRepo.save(rooms.map(r => this.roomRepo.create(r)));
    return { message: 'Seed creado', rooms: rooms.length };
  }
}
