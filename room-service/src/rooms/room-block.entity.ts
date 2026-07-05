import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('room_blocks')
export class RoomBlock {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ name: 'room_id', unsigned: true })
  roomId: number;

  @Column({ name: 'reservation_id', unsigned: true, unique: true })
  reservationId: number;

  @Index()
  @Column({ name: 'check_in', type: 'date' })
  checkIn: string;

  @Index()
  @Column({ name: 'check_out', type: 'date' })
  checkOut: string;

  @CreateDateColumn({ name: 'blocked_at' })
  blockedAt: Date;
}
