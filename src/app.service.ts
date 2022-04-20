import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private exchangeService: ExchangeRateService) {}

  getHello(): string {
    return `<h1>Exchange rates</h1>
Visit <a href="/swagger">docs</a> to try exchange API`;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Called when EVERY_DAY_AT_MIDNIGHT');
    await this.exchangeService.getAll();
  }

  @Timeout(5000)
  async handleTimeout() {
    this.logger.debug('Called once after 5 seconds');
    await this.exchangeService.getAll();
  }
}
