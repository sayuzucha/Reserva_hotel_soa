import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ChargeDto, RefundDto } from './dto/charge.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('charge')
  @ApiOperation({ summary: 'Procesar cobro de reserva' })
  charge(@Body() dto: ChargeDto) {
    return this.service.charge(dto);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Reembolsar pago (compensación Saga)' })
  refund(@Body() dto: RefundDto) {
    return this.service.refund(dto);
  }
}
