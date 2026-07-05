import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['SINGLE', 'DOUBLE', 'SUITE', 'EVENT_HALL'] })
  type: string;

  @Column({ type: 'tinyint', unsigned: true })
  capacity: number;

  @Column({ name: 'price_per_night', type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;
}
