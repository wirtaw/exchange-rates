import { Injectable, Logger } from '@nestjs/common';
import { Quote } from './quote.interface';
import { QuoteResponseDto } from './dto/quoteResponse.dto';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  constructor(private exchangeService: ExchangeRateService) {}

  calculate(quote: Quote): QuoteResponseDto {
    const { baseCurrency, quoteCurrency, baseAmount } = quote;
    const exchangeRate = this.exchangeService.getRate(
      baseCurrency,
      quoteCurrency,
    );
    this.logger.debug(
      `get ${exchangeRate} from ${baseCurrency} to ${quoteCurrency} `,
    );
    const quoteAmount: number = Math.round(exchangeRate * baseAmount);

    return {
      exchangeRate,
      quoteAmount,
    };
  }
}
