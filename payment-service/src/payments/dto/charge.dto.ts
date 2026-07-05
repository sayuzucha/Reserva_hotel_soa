import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, IsEnum, IsString } from 'class-validator';

export class ChargeDto {
  @ApiProperty() @IsInt() @IsPositive() reservationId: number;
  @ApiProperty() @IsInt() @IsPositive() guestId: number;
  @ApiProperty() @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ enum: ['CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'] })
  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'])
  method: string;
}

export class RefundDto {
  @ApiProperty() @IsInt() @IsPositive() reservationId: number;
  @ApiProperty() @IsString() reason: string;
}
