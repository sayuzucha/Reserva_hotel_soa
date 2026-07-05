import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SagaLog, SagaStepStatus } from './saga-log.entity';

@Injectable()
export class SagaService {
  constructor(
    @InjectRepository(SagaLog)
    private readonly sagaLogRepo: Repository<SagaLog>,
  ) {}

  async log(reservationId: number, step: string, status: SagaStepStatus) {
    const entry = this.sagaLogRepo.create({ reservationId, step, status });
    return this.sagaLogRepo.save(entry);
  }
}
