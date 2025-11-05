import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
      routeModule?: string;
    }
  }
}
