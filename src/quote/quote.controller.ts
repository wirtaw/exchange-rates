import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  Logger,
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
import { ParseCurrencyPipe } from '../common/parseCurrency.pipe';
import { QuoteResponseDto } from './dto/quoteResponse.dto';

@ApiTags('quote')
@Controller('quote')
export class QuoteController {
  private readonly logger = new Logger(QuoteController.name);
  constructor(private readonly quoteService: QuoteService) {}

  @ApiOperation({ summary: 'Get quote to convert currencies' })
  @ApiOkResponse({
    status: 200,
    description: 'Retrieved exchange amount and rate',
    type: QuoteResponseDto,
  })
  @ApiNotFoundResponse({
    status: 400,
    description: 'No quote',
  })
  @ApiBadRequestResponse({
    description: 'Param not valid',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Get('/')
  getQuote(
    @Query('baseCurrency', new DefaultValuePipe(''), ParseCurrencyPipe)
    baseCurrency: string,
    @Query('quoteCurrency', new DefaultValuePipe(''), ParseCurrencyPipe)
    quoteCurrency: string,
    @Query('baseAmount', ParseIntPipe)
    baseAmount: number,
  ): QuoteResponseDto {
    this.logger.debug(
      `getQuote from ${baseCurrency} to ${quoteCurrency} with amount ${baseAmount}`,
    );
    if (baseCurrency === quoteCurrency) {
      throw new HttpException(
        `baseCurrency:${baseCurrency} and quoteCurrency:${quoteCurrency} must differ`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result: QuoteResponseDto = this.quoteService.calculate({
      baseCurrency,
      quoteCurrency,
      baseAmount,
    });

    if (result.exchangeRate === 0) {
      throw new HttpException(
        `exchangeRate:${result.exchangeRate} is equal zero`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
