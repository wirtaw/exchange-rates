import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { QuoteModule } from '../src/quote/quote.module';
import { QuoteService } from '../src/quote/quote.service';

describe('QuoteController (e2e)', () => {
  let app: INestApplication;
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS';
  const quoteService = {
    calculate: () => ({
      exchangeRate: 0,
      quoteAmount: 0,
    }),
  };

  beforeEach(async () => {
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
    })
      .overrideProvider(QuoteService)
      .useValue(quoteService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
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

  it('/quote?baseCurrency=EUR&quoteCurrency=USD&baseAmount=1000 (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/quote?baseCurrency=EUR&quoteCurrency=USD&baseAmount=1000')
      .expect(200)
      .expect({
        exchangeRate: 0,
        quoteAmount: 0,
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
