import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger = new Logger(AllExceptionsFilter.name);
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(error: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();

    const httpStatusCode =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      error?.message || 'An error occurred kindly contact support';
    const defaultResponse = {
      errorMessage,
      statusCode: httpStatusCode,
    };

    const responseBody = {
      ...(typeof error.getResponse === 'function'
        ? error?.getResponse()
        : defaultResponse),
      path: httpAdapter.getRequestUrl(context.getRequest()),
    };

    this.logger.error(JSON.stringify(responseBody));

    httpAdapter.reply(context.getResponse(), responseBody, httpStatusCode);
  }
}
