import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ParseCurrencyPipe } from './parseCurrency.pipe';

describe('ParseCurrencyPipe', () => {
  let pipe: ParseCurrencyPipe;
  const SUGGESTED_CURRENCIES = 'EUR,USD,GBP,ILS';

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
      providers: [ParseCurrencyPipe],
    }).compile();

    pipe = module.get<ParseCurrencyPipe>(ParseCurrencyPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('success validation', () => {
    it('should valid baseCurrency EUR', async () => {
      const value = 'EUR';
      const check = pipe.transform(value, {
        data: 'baseCurrency',
        metatype: undefined,
        type: 'param',
      });
      expect(check).toEqual(value);
    });

    it('should valid quoteCurrency EUR', async () => {
      const value = 'EUR';
      const check = pipe.transform(value, {
        data: 'quoteCurrency',
        metatype: undefined,
        type: 'param',
      });
      expect(check).toEqual(value);
    });
  });

  describe('failed validation ', () => {
    it('should invalid quoteCurrency PLN', async () => {
      const value = 'PLN';
      try {
        pipe.transform(value, {
          data: 'quoteCurrency',
          metatype: undefined,
          type: 'param',
        });
      } catch (error) {
        expect(error.toString()).toEqual(
          `BadRequestException: quoteCurrency validation failed. Currency is not from list: ${SUGGESTED_CURRENCIES}`,
        );
      }
    });

    it('should invalid quoteCurrency usd lower case', async () => {
      const value = 'usd';
      try {
        pipe.transform(value, {
          data: 'quoteCurrency',
          metatype: undefined,
          type: 'param',
        });
      } catch (error) {
        expect(error.toString()).toEqual(
          `BadRequestException: quoteCurrency validation failed. Currency is not from list: ${SUGGESTED_CURRENCIES}`,
        );
      }
    });

    it('should invalid quoteCurrency empty', async () => {
      const value = '';
      try {
        pipe.transform(value, {
          data: 'quoteCurrency',
          metatype: undefined,
          type: 'param',
        });
      } catch (error) {
        expect(error.toString()).toEqual(
          'BadRequestException: quoteCurrency validation failed. Currency is empty',
        );
      }
    });
  });
});
