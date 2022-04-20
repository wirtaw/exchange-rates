import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ParseCurrencyPipe implements PipeTransform<string, string> {
  constructor(private readonly configService: ConfigService) {}

  transform(value: string, metadata: ArgumentMetadata): string {
    const { data } = metadata;
    const suggested: string[] = this.configService
      .get('SUGGESTED_CURRENCIES')
      .split(',');
    const val = value.trim();
    if (!val) {
      throw new BadRequestException(
        `${data} validation failed. Currency is empty`,
      );
    }

    if (!suggested.includes(val)) {
      throw new BadRequestException(
        `${data} validation failed. Currency is not from list: ${suggested.join(
          ',',
        )}`,
      );
    }

    return val;
  }
}
