import { File } from 'multer';

declare module 'multer' {
  interface Multer {
    memoryStorage(): any;
  }
}

declare global {
  namespace Express {
    interface Multer {
      File: File;
    }
  }
}
