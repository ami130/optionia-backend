import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  providers: [ResponseService, CloudinaryService],
  exports: [ResponseService, CloudinaryService],
})
export class CommonModule {}
