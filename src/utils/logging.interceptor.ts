import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  logger = new Logger('REQUEST');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const { path } = context.switchToHttp().getRequest().route;
    return next
      .handle()
      .pipe(tap(() => this.logger.log(`${path} ${Date.now() - now}ms`)));
  }
}
