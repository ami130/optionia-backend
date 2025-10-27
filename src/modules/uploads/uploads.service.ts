import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  getFileStorage() {
    return diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    });
  }

  fileFilter(req: any, file: Express.Multer.File, cb: Function) {
    const allowedMimetypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedMimetypes.includes(file.mimetype)) {
      return cb(new BadRequestException('Only image files are allowed!'), false);
    }
    cb(null, true);
  }

  mapFilesToData(
    files: Express.Multer.File[],
    data: Record<string, any>,
    allowedFields: string[] = [],
    existingData?: any,
  ) {
    if (!files || files.length === 0) return;

    files.forEach((file) => {
      if (allowedFields.length === 0 || allowedFields.includes(file.fieldname)) {
        // Delete old file if exists
        if (existingData && existingData[file.fieldname]) {
          const fullPath = '.' + existingData[file.fieldname];
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }

        // Assign new path
        data[file.fieldname] = `/public/uploads/${file.filename}`;
      }
    });
  }
}

// // src/modules/uploads/uploads.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

// @Injectable()
// export class UploadsService {
//   getFileStorage() {
//     return diskStorage({
//       destination: './public/uploads',
//       filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
//       },
//     });
//   }

//   fileFilter(req: any, file: Express.Multer.File, cb: Function) {
//     const allowedMimetypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
//     if (!allowedMimetypes.includes(file.mimetype)) {
//       return cb(new BadRequestException('Only image files are allowed!'), false);
//     }
//     cb(null, true);
//   }

//   mapFilesToData(files: Express.Multer.File[], data: Record<string, any>, allowedFields: string[] = []) {
//     if (!files || files.length === 0) return;
//     files.forEach((file) => {
//       if (allowedFields.length === 0 || allowedFields.includes(file.fieldname)) {
//         data[file.fieldname] = `/public/uploads/${file.filename}`;
//       }
//     });
//   }
// }
