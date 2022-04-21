import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { QuoteModule } from '../src/quote/quote.module';
import { QuoteService } from '../src/quote/quote.service';
import { ExchangeRateService } from '../src/exchange-rate/exchange-rate.service';
import { Cache } from '../src/cache/cache';

describe('QuoteController (e2e)', () => {
  let app: INestApplication;
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS,PLN';
  let exchangeService: ExchangeRateService;
  let rates: Cache;

  beforeAll(() => {
    rates = new Cache();
  });

  beforeEach(async () => {
    const ExchangeRateServiceProvider = {
      provide: ExchangeRateService,
      useFactory: () => ({
        getRate: jest.fn((baseCurrency: string, quoteCurrency: string) => {
          const cache: Cache = new Cache();

          cache.set('EUR:USD', 4.5);
          cache.set('EUR:GBP', 1.1);
          cache.set('EUR:ILS', 1.6);

          cache.set('USD:EUR', 4.5);
          cache.set('USD:GBP', 1.2);
          cache.set('USD:ILS', 1.7);

          cache.set('GBP:USD', 4.5);
          cache.set('GBP:EUR', 1.3);
          cache.set('GBP:ILS', 1.8);

          cache.set('ILS:USD', 4.5);
          cache.set('ILS:GBP', 1.4);
          cache.set('ILS:EUR', 1.9);

          return cache.get(`${baseCurrency}:${quoteCurrency}`);
        }),
      }),
    };
    const loadRates = (): void => {
      rates.set('EUR:USD', 4.0);
      rates.set('EUR:GBP', 1.2);
      rates.set('EUR:ILS', 1.6);

      rates.set('USD:EUR', 4.1);
      rates.set('USD:GBP', 1.3);
      rates.set('USD:ILS', 1.7);

      rates.set('GBP:USD', 4.2);
      rates.set('GBP:EUR', 1.4);
      rates.set('GBP:ILS', 1.8);

      rates.set('ILS:USD', 4.3);
      rates.set('ILS:GBP', 1.5);
      rates.set('ILS:EUR', 1.9);
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              SUGGESTED_CURRENCIES,
            }),
          ],
        }),
        QuoteModule,
      ],
      providers: [QuoteService, ExchangeRateServiceProvider],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    exchangeService = moduleRef.get<ExchangeRateService>(ExchangeRateService);
    exchangeService.rates.clear();
    rates.clear();
    loadRates();
  });

  it('/quote (GET) - Not Found', () => {
    return request(app.getHttpServer()).get('/quote').expect(400).expect({
      statusCode: 400,
      message: 'quoteCurrency validation failed. Currency is empty',
      error: 'Bad Request',
    });
  });

  it('/quote?baseCurrency=EUR (GET) - Validation failed', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'quoteCurrency validation failed. Currency is empty',
        error: 'Bad Request',
      });
  });

  it('/quote?quoteCurrency=EUR (GET) - Validation failed', () => {
    return request(app.getHttpServer())
      .get('/quote?quoteCurrency=EUR')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'baseCurrency validation failed. Currency is empty',
        error: 'Bad Request',
      });
  });

  it('/quote?baseCurrency=EUR&quoteCurrency=USD (GET) - Validation failed', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR&quoteCurrency=USD')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      });
  });

  it('/quote?baseCurrency=EUR&quoteCurrency=USD&baseAmount=1000 (GET) - rate eur to usd to 4', () => {
    exchangeService.rates = rates;
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR&quoteCurrency=USD&baseAmount=1000')
      .expect(200)
      .expect({
        exchangeRate: 4,
        quoteAmount: 4000,
      });
  });

  it('/quote?baseCurrency=EUR&quoteCurrency=PLN&baseAmount=1000 (GET) - 0', () => {
    exchangeService.rates = rates;
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR&quoteCurrency=PLN&baseAmount=1000')
      .expect(400)
      .expect({
        message: 'exchangeRate:0 is equal zero',
        statusCode: 400,
      });
  });

  it('/quote?baseCurrency=XXX&quoteCurrency=USD&baseAmount=1000 (GET) - Validation failed', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=XXX&quoteCurrency=USD&baseAmount=1000')
      .expect(400)
      .expect({
        statusCode: 400,
        message: `baseCurrency validation failed. Currency is not from list: ${SUGGESTED_CURRENCIES}`,
        error: 'Bad Request',
      });
  });

  it('/quote?baseCurrency=EUR&quoteCurrency=XXX&baseAmount=1000 (GET) - Validation failed', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR&quoteCurrency=XXX&baseAmount=1000')
      .expect(400)
      .expect({
        statusCode: 400,
        message: `quoteCurrency validation failed. Currency is not from list: ${SUGGESTED_CURRENCIES}`,
        error: 'Bad Request',
      });
  });

  it('/quote?baseCurrency=USD&quoteCurrency=USD&baseAmount=1000 (GET) - Same currencies', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=USD&quoteCurrency=USD&baseAmount=1000')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'baseCurrency:USD and quoteCurrency:USD must differ',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
