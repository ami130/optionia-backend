// src/common/middlewares/module.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ModuleMiddleware implements NestMiddleware {
  // Dynamic route to module mapping
  private readonly routeModuleMap: { [key: string]: string } = {
    categories: 'category',
    blog: 'blog',
    products: 'product',
    users: 'users',
    modules: 'module', // Add this mapping
    roles: 'role', // Uncomment this
    services: 'services',
    pricing: 'pricing',
    tags: 'tag',
    contacts: 'contact',
    reviews: 'review',
    carts: 'cart',
    pages: 'page',
    website: 'website',
    uploads: 'upload',
    sections: 'section',
    permissions: 'permission', // Uncomment this
    'terms-conditions': 'terms-conditions',
  };

  use(req: Request, res: Response, next: NextFunction) {
    const pathSegments = req.originalUrl.split('/').filter((segment) => segment);

    // Find the first segment that matches a module
    let moduleSlug: string | undefined;

    for (const segment of pathSegments) {
      if (this.routeModuleMap[segment]) {
        moduleSlug = this.routeModuleMap[segment];
        break;
      }
    }

    // If no match found, use the first path segment as module name
    if (!moduleSlug && pathSegments.length > 0) {
      moduleSlug = pathSegments[0].toLowerCase();
    }

    (req as any).routeModule = moduleSlug || 'default';

    console.log(`🏷️ Dynamic Middleware: Module set to "${(req as any).routeModule}" for ${req.method} ${req.url}`);
    next();
  }
}