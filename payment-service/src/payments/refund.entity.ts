import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ name: 'payment_id', unsigned: true })
  paymentId: number;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: 'refunded_at' })
  refundedAt: Date;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;
}
