import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<h1>Exchange rates</h1>
Visit <a href="/docs">docs</a> to try exchange API`;
  }
}
