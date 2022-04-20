import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { QuoteModule } from './quote/quote.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';

const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : undefined;

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      envFilePath: envFilePath,
      ignoreEnvVars: process.env.NODE_ENV === 'test',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    QuoteModule,
    ExchangeRateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
