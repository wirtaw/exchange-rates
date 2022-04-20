import { Injectable } from '@nestjs/common';
import { Quote } from './quote.interface';
import { QuoteResponseDto } from './dto/quoteResponse.dto';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class QuoteService {
  constructor(private exchangeService: ExchangeRateService) {}

  calculate(quote: Quote): QuoteResponseDto {
    const { baseCurrency, quoteCurrency, baseAmount } = quote;
    console.info(
      `quote baseCurrency:${baseCurrency} quoteCurrency:${quoteCurrency}`,
    );
    const exchangeRate = this.exchangeService.getRate(
      baseCurrency,
      quoteCurrency,
    );
    const quoteAmount: number = exchangeRate * baseAmount;

    return {
      exchangeRate,
      quoteAmount,
    };
  }
}
