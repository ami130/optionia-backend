import { Global, Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { CloudinaryService } from './services/cloudinary.service';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
import { PaginationService } from './services/pagination.service';

@Global()
@Module({
  providers: [ResponseService, CloudinaryService, ApiResponseInterceptor, PaginationService],
  exports: [ResponseService, CloudinaryService, ApiResponseInterceptor, PaginationService],
})
export class CommonModule {}
