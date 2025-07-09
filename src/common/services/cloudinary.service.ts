/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Express } from 'express';
import 'multer'; // This import extends the Express namespace with Multer types

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadImage(file: Express.Multer.File, folder = 'uploads'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file?.buffer) return reject(new Error('Invalid file buffer'));

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}

// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// @Injectable()
// export class CloudinaryService {
//   constructor() {
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });
//   }

//   uploadImage(file: Express.Multer.File, folder = 'uploads'): Promise<UploadApiResponse> {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder },
//         (error: UploadApiErrorResponse, result: UploadApiResponse) => {
//           if (error) return reject(error);
//           resolve(result);
//         },
//       );

//       uploadStream.end(file.buffer);
//     });
//   }

//   // ✅ Add this method to support deletion
//   async deleteImage(publicId: string): Promise<{ result: string }> {
//     return new Promise((resolve, reject) => {
//       cloudinary.uploader.destroy(publicId, (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       });
//     });
//   }
// }
