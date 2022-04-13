import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return Main application page with docs url', () => {
      expect(appController.getHello()).toBe(`<h1>Exchange rates</h1>
Visit <a href="/docs">docs</a> to try exchange API`);
    });
  });
});
