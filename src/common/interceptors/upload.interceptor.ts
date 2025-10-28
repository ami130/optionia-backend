// // src/common/interceptors/upload.interceptor.ts
// import { AnyFilesInterceptor } from '@nestjs/platform-express';
// import { UploadsService } from 'src/modules/uploads/uploads.service';

// // Factory function: returns a NestJS interceptor class
// export const createUploadInterceptor = (uploadsService: UploadsService) => {
//   return AnyFilesInterceptor({
//     storage: uploadsService.getFileStorage(),
//     fileFilter: uploadsService.fileFilter,
//   });
// };
