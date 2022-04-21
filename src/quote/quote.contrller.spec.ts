import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { QuoteService } from './quote.service';
import { Rate } from '../exchange-rate/exchange-rate.service';
import { QuoteController } from './quote.controller';

describe('QuoteController', () => {
  let service: QuoteService;
  let controller: QuoteController;
  let module: TestingModule;
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS';

  const QuoteServiceProvider = {
    provide: QuoteService,
    useFactory: () => ({
      calculate: jest.fn(({ baseCurrency, quoteCurrency }) => {
        const rates: Map<string, Rate> = new Map();

        rates.set('EUR', { USD: 4.1, GBP: 1.7, ILS: 1.1 });
        rates.set('USD', { EUR: 4.2, GBP: 1.8, ILS: 1.3 });
        rates.set('GBP', { USD: 4.3, EUR: 1.9, ILS: 1.5 });
        rates.set('ILS', { USD: 4.4, GBP: 1.8, EUR: 1.7 });

        const exchangeRate = rates.get(baseCurrency)[quoteCurrency]
          ? rates.get(baseCurrency)[quoteCurrency]
          : 0;

        return {
          exchangeRate,
          quoteAmount: Math.round(exchangeRate * 2),
        };
      }),
    }),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              SUGGESTED_CURRENCIES,
              EXCHANGE_URL: 'http://exchange-rates.local',
            }),
          ],
        }),
      ],
      controllers: [QuoteController],
      providers: [QuoteServiceProvider],
    }).compile();
  });

  beforeEach(async () => {
    service = module.get<QuoteService>(QuoteService);
    controller = module.get<QuoteController>(QuoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('success', () => {
    it('should return quote rate', async () => {
      expect(await controller.getQuote('EUR', 'USD', 100)).toEqual({
        exchangeRate: 4.1,
        quoteAmount: 8,
      });
    });
  });

  describe('failed', () => {
    it('should return error same currency', async () => {
      try {
        await controller.getQuote('EUR', 'EUR', 100);
      } catch (error) {
        expect(error.toString()).toEqual(
          `HttpException: baseCurrency:EUR and quoteCurrency:EUR must differ`,
        );
      }
    });

    it('should return error no exchange rate', async () => {
      try {
        await controller.getQuote('EUR', 'PLN', 100);
      } catch (error) {
        expect(error.toString()).toEqual(
          `HttpException: exchangeRate:0 is equal zero`,
        );
      }
    });
  });
});
