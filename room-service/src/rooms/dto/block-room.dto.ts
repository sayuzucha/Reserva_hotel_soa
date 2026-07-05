import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class BlockRoomDto {
  @ApiProperty() @IsInt() @IsPositive() roomId: number;
  @ApiProperty() @IsInt() @IsPositive() reservationId: number;
  @ApiProperty({ example: '2026-07-10' }) @IsDateString() checkIn: string;
  @ApiProperty({ example: '2026-07-15' }) @IsDateString() checkOut: string;
}
