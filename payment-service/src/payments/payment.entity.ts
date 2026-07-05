import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ name: 'reservation_id', unsigned: true, unique: true })
  reservationId: number;

  @Column({ name: 'guest_id', unsigned: true })
  guestId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'] })
  method: string;

  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REFUNDED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Column({ name: 'charged_at', type: 'timestamp', nullable: true })
  chargedAt: Date;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
