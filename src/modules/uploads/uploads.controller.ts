// src/modules/uploads/uploads.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return {
      filename: file.filename,
      url: `/public/uploads/${file.filename}`,
    };
  }
}


// // src/modules/uploads/uploads.controller.ts
// import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

// @Controller('uploads')
// export class UploadsController {
//   @Post('image')
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: diskStorage({
//         destination: './public/uploads', // local folder for uploaded images
//         filename: (req, file, cb) => {
//           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//           const ext = extname(file.originalname);
//           cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//         },
//       }),
//       fileFilter: (req, file, cb) => {
//         if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
//           return cb(new BadRequestException('Only image files are allowed!'), false);
//         }
//         cb(null, true);
//       },
//     }),
//   )
//   uploadFile(@UploadedFile() file: Express.Multer.File) {
//     if (!file) {
//       throw new BadRequestException('File is required');
//     }

//     return {
//       filename: file.filename,
//       url: `/public/uploads/${file.filename}`, // accessible URL
//     };
//   }
// }
