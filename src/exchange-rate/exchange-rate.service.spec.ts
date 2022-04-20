import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService, Rate } from './exchange-rate.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  const HttpServiceProvider = {
    provide: HttpService,
    useFactory: () => ({
      get: (currency: string) => {
        let res: any = {};
        switch (currency) {
          case 'EUR':
            res = { data: { USD: 4.5, GBP: 1.1, ILS: 1.5 } };
            break;
          case 'USD':
            res = { data: { EUR: 4.5, GBP: 1.1, ILS: 1.5 } };
            break;
          case 'GBP':
            res = { data: { USD: 4.5, EUR: 1.1, ILS: 1.5 } };
            break;
          case 'ILS':
            res = { data: { USD: 4.5, GBP: 1.1, EUR: 1.5 } };
            break;
          default:
            res = { data: { USD: 4.5, GBP: 1.1, ILS: 1.5 } };
            break;
        }

        return { subscribe: () => res };
      },
    }),
  };
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS';

  const loadRates = (): Map<string, Rate> => {
    const rates = new Map();

    rates.set('EUR', { USD: 4.5, GBP: 1.1, ILS: 1.5 });
    rates.set('USD', { EUR: 4.5, GBP: 1.1, ILS: 1.5 });
    rates.set('GBP', { USD: 4.5, EUR: 1.1, ILS: 1.5 });
    rates.set('ILS', { USD: 4.5, GBP: 1.1, EUR: 1.5 });

    return rates;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      providers: [ExchangeRateService, HttpServiceProvider],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
    service.rates.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRate', () => {
    it('should get rate EUR/USD', async () => {
      service.rates = loadRates();
      const expectedRate = 4.5;
      const rate = service.getRate('EUR', 'USD');
      expect(rate).toEqual(expectedRate);
    });

    it('should get rate EUR/USD no rates', async () => {
      const expectedRate = 0;
      const rate = service.getRate('EUR', 'USD');
      expect(rate).toEqual(expectedRate);
    });
  });

  describe('loadCurrency', () => {
    it('should load currency', async () => {
      const answer = await service.loadCurrency('EUR');
      expect(typeof answer).toEqual('object');
      expect(answer.subscribe()).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should load all currency', async () => {
      await service.getAll();
      expect(service.rates.get('EUR')).toEqual({
        USD: 4.5,
        GBP: 1.1,
        ILS: 1.5,
      });
    });
  });
});
