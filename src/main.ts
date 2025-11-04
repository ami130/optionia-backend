// src/main.ts
import * as crypto from 'crypto';
if (!globalThis.crypto) (globalThis as any).crypto = crypto;

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger,
  BadRequestException,
  Request,
  Response,
} from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 🔍 Environment info
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const PORT = configService.get<number>('PORT') || 3000;

  logger.log(`🚀 Starting application in ${NODE_ENV} mode`);

  // ✅ Auto-seed only in development or if explicitly enabled
  if (NODE_ENV === 'development' || configService.get('ENABLE_SEEDING') === 'true') {
    try {
      const seeder = app.get(SeederService);
      await seeder.seed();
      logger.log('✅ Database seeding completed');
    } catch (error) {
      logger.warn('⚠️ Seeding skipped or failed:', error.message);
    }
  }

  // ✅ Body size limit
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          const constraints = err.constraints
            ? Object.values(err.constraints).join(', ')
            : `property ${err.property} should not exist`;
          return `${err.property} - ${constraints}`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // ✅ Global interceptors and filters
  const reflector = app.get(Reflector);
  const apiResponseInterceptor = app.get(ApiResponseInterceptor);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector), apiResponseInterceptor);
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // ✅ CORS configuration for production
  const isProduction = NODE_ENV === 'production';
  const allowedOrigins = isProduction
    ? [
        'https://your-frontend-domain.onrender.com', // Your frontend URL
        'https://organica-backend.onrender.com', // Your backend URL
      ]
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        logger.warn(`🚫 CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

  // ✅ Health check endpoint - CORRECT WAY
  // Create a simple controller for health check or use app.getHttpAdapter()
  const server = app.getHttpAdapter().getInstance();

  server.get('/health', (req: Request, res: any) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // ✅ Start server
  await app.listen(PORT, '0.0.0.0');
  logger.log(`🎉 Application running on port ${PORT} in ${NODE_ENV} mode`);
  logger.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
}

bootstrap().catch((err) => {
  console.error('❌ Application failed to start', err);
  process.exit(1);
});

// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable prettier/prettier */

// import * as crypto from 'crypto';
// if (!globalThis.crypto) (globalThis as any).crypto = crypto; // ✅ polyfill for Node crypto API

// import { NestFactory, Reflector } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';
// import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
// import { ClassSerializerInterceptor, ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
// import * as bodyParser from 'body-parser';
// import { ConfigService } from '@nestjs/config';
// import { SeederService } from './seeder/seeder.service';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   const seeder = app.get(SeederService);
//   try {
//     await seeder.seed();
//   } catch (error) {
//     console.warn('Seeding skipped or failed:', error.message);
//   }

//   const configService = app.get(ConfigService);
//   const logger = new Logger('Bootstrap');

//   // 🔍 Debug info
//   logger.debug(`DB_HOST: ${configService.get('DB_HOST')}`);
//   logger.debug(`NODE_ENV: ${configService.get('NODE_ENV')}`);

//   const PORT = configService.get<number>('PORT') || 3000;
//   const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';

//   // ✅ Body size limit
//   app.use(bodyParser.json({ limit: '10mb' }));
//   app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

//   // In main.ts - update your validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true, // Keep this true for security
//       transformOptions: {
//         enableImplicitConversion: true,
//         excludeExtraneousValues: false, // Allow extra values but filter them
//       },
//       exceptionFactory: (errors) => {
//         const messages = errors.map((err) => {
//           const constraints = err.constraints
//             ? Object.values(err.constraints).join(', ')
//             : `property ${err.property} should not exist`;
//           return `${err.property} - ${constraints}`;
//         });

//         // Log validation errors for debugging
//         console.log('🔍 Validation Errors:', messages);
//         return new BadRequestException(messages);
//       },
//     }),
//   );

//   // app.useGlobalPipes(
//   //   new ValidationPipe({
//   //     transform: true,
//   //     whitelist: true,
//   //     skipMissingProperties: false, // keep optional fields
//   //     forbidNonWhitelisted: true,
//   //     transformOptions: { enableImplicitConversion: true },
//   //     exceptionFactory: (errors) => {
//   //       const messages = errors.map((err) => {
//   //         const constraints = err.constraints ? Object.values(err.constraints).join(', ') : 'validation error';
//   //         return `${err.property} - ${constraints}`;
//   //       });
//   //       return new BadRequestException(messages);
//   //     },
//   //   }),
//   // );

//   // ✅ Auto-seed Admin User (safe)

//   // try {
//   //   const seeder = app.get(SeederService);
//   //   await seeder.seed();
//   // } catch (error) {
//   //   if ((error as any).code !== '23505') throw error;
//   //   logger.warn('Admin user already exists, skipping creation');
//   // }

//   // ✅ Global interceptors and filters
//   const reflector = app.get(Reflector);
//   const apiResponseInterceptor = app.get(ApiResponseInterceptor);
//   app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector), apiResponseInterceptor);
//   app.useGlobalFilters(new TypeOrmExceptionFilter());

//   // ✅ CORS configuration (industry-level)
//   const rawOrigins = configService.get<string>('CORS_ORIGINS') || '';
//   let allowedOrigins: string[] = [];
//   try {
//     allowedOrigins = JSON.parse(rawOrigins);
//   } catch {
//     allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
//   }

//   app.enableCors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true); // allow Postman, server-side requests
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       logger.warn(`Blocked CORS request from origin: ${origin}`);
//       return callback(new Error(`CORS policy blocked: ${origin}`), false);
//     },
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true, // required if using cookies or session auth
//   });

//   // ✅ Start server
//   await app.listen(PORT, '0.0.0.0');
//   logger.log(`🚀 Application running on port ${PORT} in ${NODE_ENV} mode`);
// }

// bootstrap().catch((err) => {
//   console.error('❌ Application failed to start', err);
//   process.exit(1);
// });
