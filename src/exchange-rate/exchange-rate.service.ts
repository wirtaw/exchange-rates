import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeRateResponse } from './exchange-rate-response.interface';
import { Cache } from '../cache/cache';

export interface Rate {
  [key: string]: number;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  public rates = new Cache();

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  loadCurrency(
    currency: string,
  ): Observable<AxiosResponse<ExchangeRateResponse>> {
    const url: string = this.configService.get('EXCHANGE_URL');
    this.logger.debug(`Call ${url}${currency}`);
    return this.httpService.get(`${url}${currency}`);
  }

  async getAll(): Promise<void> {
    const suggested: string[] = this.configService
      .get('SUGGESTED_CURRENCIES')
      .split(',');

    if (Array.isArray(suggested) && suggested.length > 0) {
      for await (const currency of suggested) {
        const res = await this.loadCurrency(currency);
        const otherSuggested = suggested.filter((it) => it !== currency);
        res.subscribe((value) => {
          if (value?.data?.base_code && value?.data?.rates) {
            const { base_code, rates } = value.data;

            for (const currency of otherSuggested) {
              this.rates.set(`${base_code}:${currency}`, rates[currency]);
            }
          }
        });
      }
    }
  }

  getRate(baseCurrency: string, rateCurrency: string): number {
    if (!this.rates.has(`${baseCurrency}:${rateCurrency}`)) {
      return 0;
    }

    const rate = this.rates.get(`${baseCurrency}:${rateCurrency}`);
    if (!rate) {
      return 0;
    }
    this.logger.debug(`getRate ${baseCurrency} ${rateCurrency} ${rate}`);

    return rate;
  }
}
