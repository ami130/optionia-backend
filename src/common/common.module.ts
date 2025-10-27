import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { CloudinaryService } from './services/cloudinary.service';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';

@Module({
  providers: [ResponseService, CloudinaryService, ApiResponseInterceptor],
  exports: [ResponseService, CloudinaryService, ApiResponseInterceptor],
})
export class CommonModule {}
