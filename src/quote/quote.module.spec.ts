import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QuoteModule } from './quote.module';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

describe('QuoteModule', () => {
  it('should compile the quote module', async () => {
    const module = await Test.createTestingModule({
      controllers: [QuoteController],
      providers: [QuoteService, ConfigService],
      imports: [QuoteModule, ExchangeRateModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(QuoteController)).toBeInstanceOf(QuoteController);
    expect(module.get(QuoteService)).toBeInstanceOf(QuoteService);
    expect(module.get(ExchangeRateModule)).toBeInstanceOf(ExchangeRateModule);
  });
});
