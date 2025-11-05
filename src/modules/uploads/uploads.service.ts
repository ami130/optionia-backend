import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import multer from 'multer';

@Injectable()
export class UploadsService {
  getFileStorage() {
    return multer.diskStorage({
      destination: './public/uploads',
      filename: (req, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
        cb(null, filename);
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
    options?: { arrayIndex?: Record<string, number> },
  ) {
    if (!files || files.length === 0) return;

    files.forEach((file: Express.Multer.File) => {
      if (allowedFields.length === 0 || allowedFields.includes(file.fieldname)) {
        // ✅ Use consistent file URL format
        const fileUrl = `/public/uploads/${file.filename}`;

        // Handle single vs array replacement
        if (Array.isArray(existingData?.[file.fieldname])) {
          const index = options?.arrayIndex?.[file.fieldname];
          const arr = [...existingData[file.fieldname]];

          // Delete old file at that index if exists
          if (typeof index === 'number' && arr[index]) {
            const oldFilename = this.getFilenameFromUrl(arr[index]);
            const fullPath = `./public/uploads/${oldFilename}`;
            this.safeDeleteFile(fullPath);
            arr[index] = fileUrl;
          } else {
            // append if no index provided
            arr.push(fileUrl);
          }

          data[file.fieldname] = arr.slice(0, 5); // enforce max 5
        } else {
          // single field replacement
          if (existingData && existingData[file.fieldname]) {
            const oldFilename = this.getFilenameFromUrl(existingData[file.fieldname]);
            const fullPath = `./public/uploads/${oldFilename}`;
            this.safeDeleteFile(fullPath);
          }
          data[file.fieldname] = fileUrl;
        }
      }
    });
  }

  // ✅ Helper method to extract filename from URL
  private getFilenameFromUrl(url: string): string {
    if (!url) return '';
    return url.split('/').pop() || '';
  }

  // ✅ Safe file deletion
  private safeDeleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Warning: Could not delete file ${filePath}`, error.message);
    }
  }
}
// // src/modules/uploads/uploads.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';
// import { extname } from 'path';
// import * as fs from 'fs';
// import multer from 'multer';

// @Injectable()
// export class UploadsService {
//   getFileStorage() {
//     return multer.diskStorage({
//       destination: './public/uploads',
//       filename: (req, file: Express.Multer.File, cb) => {
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

//   mapFilesToData(
//     files: Express.Multer.File[],
//     data: Record<string, any>,
//     allowedFields: string[] = [],
//     existingData?: any,
//     options?: { arrayIndex?: Record<string, number> },
//   ) {
//     if (!files || files.length === 0) return;

//     files.forEach((file: Express.Multer.File) => {
//       if (allowedFields.length === 0 || allowedFields.includes(file.fieldname)) {
//         // Handle single vs array replacement
//         if (Array.isArray(existingData?.[file.fieldname])) {
//           const index = options?.arrayIndex?.[file.fieldname];
//           const arr = [...existingData[file.fieldname]];

//           // Delete old file at that index if exists
//           if (typeof index === 'number' && arr[index]) {
//             const fullPath = '.' + arr[index];
//             if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
//             arr[index] = `/public/uploads/${file.filename}`;
//           } else {
//             // append if no index provided
//             arr.push(`/public/uploads/${file.filename}`);
//           }

//           data[file.fieldname] = arr.slice(0, 5); // enforce max 5
//         } else {
//           // single field replacement
//           if (existingData && existingData[file.fieldname]) {
//             const fullPath = '.' + existingData[file.fieldname];
//             if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
//           }
//           data[file.fieldname] = `/public/uploads/${file.filename}`;
//         }
//       }
//     });
//   }
// }
