import { Injectable } from '@nestjs/common';
import { Quote } from './quote.interface';
import { QuoteResponseDto } from './dto/quoteResponse.dto';

@Injectable()
export class QuoteService {
  calculate(quote: Quote): QuoteResponseDto {
    const { baseCurrency, quoteCurrency, baseAmount } = quote;
    const exchangeRate = 1.5;
    const quoteAmount: number = exchangeRate * baseAmount;
    return {
      exchangeRate,
      quoteAmount,
    };
  }
}
