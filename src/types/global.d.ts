// src/types/global.d.ts
import * as multer from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      export interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }

  // Re-export multer types globally
  export import Multer = multer;
}

// This export is needed for the file to be treated as a module
export {};
