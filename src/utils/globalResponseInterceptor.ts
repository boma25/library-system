/** @format */

import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { TServerResponse } from 'src/@types/app.types';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, TServerResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<TServerResponse<T>> {
    return next.handle().pipe(
      map((response) => ({
        data: response?.data,
        limit: response?.limit,
        page: response?.page,
        lastId: response?.lastId,
        message: response?.message,
        status: HttpStatus.OK,
      })),
    );
  }
}
