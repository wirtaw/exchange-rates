import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from './quote.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

describe('QuoteService', () => {
  let service: QuoteService;
  const ExchangeServiceProvider = {
    provide: ExchangeRateService,
    useFactory: () => ({
      getRate: (baseCurrency: string, quoteCurrency: string) => {
        const rates = new Map();

        rates.set('EUR', { USD: 4.5, GBP: 1.1, ILS: 1.5 });
        rates.set('USD', { EUR: 4.5, GBP: 1.1, ILS: 1.5 });
        rates.set('GBP', { USD: 4.5, EUR: 1.1, ILS: 1.5 });
        rates.set('ILS', { USD: 4.5, GBP: 1.1, EUR: 1.5 });

        return rates.get(baseCurrency)[quoteCurrency];
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteService, ExchangeServiceProvider],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate rate', async () => {
      const expectedRate = { exchangeRate: 4.5, quoteAmount: 4.5 };
      const rate = service.calculate({
        baseCurrency: 'EUR',
        quoteCurrency: 'USD',
        baseAmount: 1,
      });
      expect(rate).toEqual(expectedRate);
    });
  });
});
