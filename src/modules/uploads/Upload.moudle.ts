// src/modules/uploads/uploads.module.ts
import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService], // ✅ make it reusable
})
export class UploadsModule {}
