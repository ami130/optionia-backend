import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ModuleMiddleware implements NestMiddleware {
  private readonly routeModuleMap: { [key: string]: string } = {
    categories: 'category',
    blog: 'blog',
    products: 'product',
    users: 'users',
    modules: 'module',
    roles: 'role',
    services: 'services',
    pricing: 'pricing',
    tags: 'tag',
    contacts: 'contact',
    reviews: 'review',
    carts: 'cart',
    page: 'page',
    website: 'website',
    uploads: 'upload',
    sections: 'section',
    permissions: 'permission',
    'terms-conditions': 'terms-conditions',
  };

  use(req: any, res: any, next: () => void) {
    // Skip middleware for login/signup routes
    if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/signup')) {
      return next();
    }

    const pathSegments = req.originalUrl.split('/').filter((segment) => segment);

    let moduleSlug: string | undefined;
    for (const segment of pathSegments) {
      if (this.routeModuleMap[segment]) {
        moduleSlug = this.routeModuleMap[segment];
        break;
      }
    }

    if (!moduleSlug && pathSegments.length > 0) {
      moduleSlug = pathSegments[0].toLowerCase();
    }

    req.routeModule = moduleSlug || 'default';
    console.log(`🏷️ Dynamic Middleware: Module set to "${req.routeModule}" for ${req.method} ${req.url}`);
    next();
  }
}