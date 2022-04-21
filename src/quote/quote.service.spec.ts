import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from './quote.service';
import {
  ExchangeRateService,
  Rate,
} from '../exchange-rate/exchange-rate.service';

describe('QuoteService', () => {
  let service: QuoteService;
  const ExchangeServiceProvider = {
    provide: ExchangeRateService,
    useFactory: () => ({
      getRate: jest.fn((baseCurrency: string, quoteCurrency: string) => {
        const rates: Map<string, Rate> = new Map();

        rates.set('EUR', { USD: 4.5, GBP: 1.1, ILS: 1.5 });
        rates.set('USD', { EUR: 4.4, GBP: 1.2, ILS: 1.6 });
        rates.set('GBP', { USD: 4.3, EUR: 1.3, ILS: 1.7 });
        rates.set('ILS', { USD: 4.2, GBP: 1.4, EUR: 1.8 });

        return rates.get(baseCurrency)[quoteCurrency];
      }),
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
    it('should calculate rate EUR / USD / 1', async () => {
      const expectedRate = { exchangeRate: 4.5, quoteAmount: 5 };
      const rate = service.calculate({
        baseCurrency: 'EUR',
        quoteCurrency: 'USD',
        baseAmount: 1,
      });
      expect(rate).toEqual(expectedRate);
    });

    it('should calculate rate ILS / GBP / 10', async () => {
      const expectedRate = { exchangeRate: 1.4, quoteAmount: 20 };
      const rate = service.calculate({
        baseCurrency: 'ILS',
        quoteCurrency: 'GBP',
        baseAmount: 14,
      });
      expect(rate).toEqual(expectedRate);
    });

    it('should calculate rate GBP / EUR / 25', async () => {
      const expectedRate = { exchangeRate: 1.3, quoteAmount: 33 };
      const rate = service.calculate({
        baseCurrency: 'GBP',
        quoteCurrency: 'EUR',
        baseAmount: 25,
      });
      expect(rate).toEqual(expectedRate);
    });

    it('should calculate rate USD / ILS / 3333', async () => {
      const expectedRate = { exchangeRate: 1.6, quoteAmount: 5333 };
      const rate = service.calculate({
        baseCurrency: 'USD',
        quoteCurrency: 'ILS',
        baseAmount: 3333,
      });
      expect(rate).toEqual(expectedRate);
    });
  });
});
