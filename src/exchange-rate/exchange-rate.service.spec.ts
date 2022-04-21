import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService } from './exchange-rate.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Cache } from '../cache/cache';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let rates: Cache;
  let spyHttpService: HttpService;
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS';
  const loadRates = (): void => {
    rates.set('EUR:USD', 4.5);
    rates.set('EUR:GBP', 1.1);
    rates.set('EUR:ILS', 1.6);

    rates.set('USD:EUR', 4.5);
    rates.set('USD:GBP', 1.2);
    rates.set('USD:ILS', 1.7);

    rates.set('GBP:USD', 4.5);
    rates.set('GBP:EUR', 1.3);
    rates.set('GBP:ILS', 1.8);

    rates.set('ILS:USD', 4.5);
    rates.set('ILS:GBP', 1.4);
    rates.set('ILS:EUR', 1.9);
  };

  beforeAll(() => {
    rates = new Cache();
  });

  beforeEach(async () => {
    const HttpServiceProvider = {
      provide: HttpService,
      useFactory: () => ({
        get: jest.fn((currency: string) => {
          let res: any = {};
          switch (currency) {
            case 'EUR':
              res = {
                base_code: 'EUR',
                rates: { USD: 4.5, GBP: 1.1, ILS: 1.5 },
              };
              break;
            case 'USD':
              res = {
                base_code: 'USD',
                rates: { EUR: 4.5, GBP: 1.1, ILS: 1.5 },
              };
              break;
            case 'GBP':
              res = {
                base_code: 'GBP',
                rates: { USD: 4.5, EUR: 1.1, ILS: 1.5 },
              };
              break;
            case 'ILS':
              res = {
                base_code: 'ILS',
                rates: { USD: 4.5, GBP: 1.1, EUR: 1.5 },
              };
              break;
            default:
              res = { base_code: 'XXX', rates: {} };
              break;
          }

          return { subscribe: () => res };
        }),
      }),
    };
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
    spyHttpService = module.get<HttpService>(HttpService);
    service.rates.clear();
    rates.clear();
    loadRates();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRate', () => {
    it('should get rate EUR/USD', async () => {
      service.rates = rates;
      const expectedRate = 4.5;
      const rate = service.getRate('EUR', 'USD');
      expect(rate).toEqual(expectedRate);
    });

    it('should get rate EUR/USD no rates', async () => {
      const expectedRate = 0;
      const rate = service.getRate('EUR', 'USD');
      expect(rate).toEqual(expectedRate);
    });

    it('should get rate EUR/PLN no rates', async () => {
      service.rates = rates;
      const expectedRate = 0;
      const rate = service.getRate('EUR', 'PLN');
      expect(rate).toEqual(expectedRate);
    });
  });

  describe('loadCurrency', () => {
    it('should load currency', async () => {
      const answer = await service.loadCurrency('EUR');
      expect(typeof answer).toEqual('object');
      expect(answer.subscribe()).toBeDefined();
      expect(spyHttpService.get).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should load all currency', async () => {
      service.rates = rates;
      await service.getAll();
      expect(spyHttpService.get).toHaveBeenCalled();
      expect(service.rates.get('USD:ILS')).toEqual(1.7);
    });
  });
});
