import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService, ConfigService],
  imports: [ExchangeRateModule],
})
export class QuoteModule {}
