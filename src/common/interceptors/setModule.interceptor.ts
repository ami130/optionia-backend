// src/common/interceptors/setModule.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SetModuleInterceptor implements NestInterceptor {
  constructor(private readonly moduleSlug: string) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();

    console.log(`🔄 Interceptor: Before - routeModule = ${request.routeModule}`);
    
    // Set the module directly on the request object
    request.routeModule = this.moduleSlug;

    console.log(`🔄 Interceptor: After - routeModule = ${request.routeModule}, setting to ${this.moduleSlug}`);

    return next.handle();
  }
}