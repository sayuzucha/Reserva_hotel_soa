import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  guestId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  roomId: number;

  @ApiProperty({ example: '2026-07-10' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  checkOut: string;
}
