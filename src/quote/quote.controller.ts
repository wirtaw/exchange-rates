import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { QuoteService } from './quote.service';
import { Quote } from './quote.interface';
import { ConfigService } from '@nestjs/config';
import { QuoteDto } from './dto/quote.dto';
import { QuoteResponseDto } from './dto/quoteResponse.dto';

@ApiTags('quote')
@Controller('quote')
export class QuoteController {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Get quote to convert currencies' })
  @ApiOkResponse({
    status: 200,
    description: 'Retrieved exchange amount and rate',
    type: QuoteResponseDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'No quote',
  })
  @ApiBadRequestResponse({
    description: 'param not valid',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Get(':baseCurrency/:quoteCurrency/:baseAmount')
  getQuote(@Param() params: QuoteDto): QuoteResponseDto {
    const { baseCurrency, quoteCurrency, baseAmount } = params;
    const supported: string[] =
      this.configService.get<string>('SUPPORTED_CURRENCIES').split(',') || [];

    if (!supported.includes(baseCurrency)) {
      throw new HttpException(
        `baseCurrency:${baseCurrency} is not supported. Please use only supported ${supported.join(
          ',',
        )} currencies`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!supported.includes(quoteCurrency)) {
      throw new HttpException(
        `quoteCurrency:${quoteCurrency} is not supported. Please use only supported ${supported.join(
          ',',
        )} currencies`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (baseCurrency === quoteCurrency) {
      throw new HttpException(
        `baseCurrency:${baseCurrency} and quoteCurrency:${quoteCurrency} must differ`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (Number.isNaN(baseAmount)) {
      throw new HttpException(
        `baseAmount:${baseAmount} is not an mumber`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const quote: Quote = { baseCurrency, quoteCurrency, baseAmount };

    return this.quoteService.calculate(quote);
  }
}
