import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';

describe('AppController', () => {
  let appController: AppController;
  const ExchangeServiceProvider = {
    provide: ExchangeRateService,
    useFactory: () => ({
      getRate: jest.fn(() => 4.5),
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ExchangeServiceProvider],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return Main application page with docs url', () => {
      expect(appController.getHello()).toBe(`<h1>Exchange rates</h1>
Visit <a href="/swagger">docs</a> to try exchange API`);
    });
  });
});
