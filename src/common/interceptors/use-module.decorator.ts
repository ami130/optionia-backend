// src/common/decorators/use-module.decorator.ts
import { UseInterceptors } from '@nestjs/common';
import { SetModuleInterceptor } from '../interceptors/setModule.interceptor';

export function UseModule(moduleSlug: string) {
  return UseInterceptors(new SetModuleInterceptor(moduleSlug));
}
