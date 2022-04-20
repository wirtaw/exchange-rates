import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
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
    description: 'param not valid',
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
    if (baseCurrency === quoteCurrency) {
      throw new HttpException(
        `baseCurrency:${baseCurrency} and quoteCurrency:${quoteCurrency} must differ`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.quoteService.calculate({
      baseCurrency,
      quoteCurrency,
      baseAmount,
    });
  }
}
