import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRestfulHealth(): string {
    return 'OK';
  }
}
