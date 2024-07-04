import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorators';
import { TApiResponse } from './@types/app.types';
import { ApiTags } from '@nestjs/swagger';

@Public()
@ApiTags('PUBLIC')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): TApiResponse<string> {
    const message = this.appService.getHello();
    return { message };
  }
}
