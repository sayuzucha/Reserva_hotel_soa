import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

export enum SagaStepStatus {
  EXECUTED = 'EXECUTED',
  COMPENSATED = 'COMPENSATED',
  FAILED = 'FAILED',
}

@Entity('saga_log')
export class SagaLog {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ name: 'reservation_id', unsigned: true })
  reservationId: number;

  @Column({ length: 50 })
  step: string;

  @Column({ type: 'enum', enum: SagaStepStatus })
  status: SagaStepStatus;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt: Date;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}
