import { IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuoteResponseDto {
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  exchangeRate: number;

  @ApiProperty()
  @IsInt()
  quoteAmount: number;
}
