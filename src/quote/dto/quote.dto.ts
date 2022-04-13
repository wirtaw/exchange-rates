import { IsNumberString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuoteCurrency } from '../quoteCurrency.enum';

export class QuoteDto {
  @ApiProperty()
  @IsNumberString()
  @MinLength(1)
  baseAmount: number;

  @ApiProperty()
  @IsEnum(QuoteCurrency)
  baseCurrency: string;

  @ApiProperty()
  @IsEnum(QuoteCurrency)
  quoteCurrency: string;
}
