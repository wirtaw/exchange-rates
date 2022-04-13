import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { QuoteModule } from './quote/quote.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QuoteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
