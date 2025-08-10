/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';
import { ResponseService } from './common/services/response.service';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { ClassSerializerInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  logger.debug(`DB_HOST: ${configService.get('DB_HOST')}`);
  logger.debug(`NODE_ENV: ${configService.get('NODE_ENV')}`);

  // Enhanced configuration
  const PORT = configService.get<number>('PORT') || 3000;
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';

  // Body parser configuration
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  try {
    const usersService = app.get(UsersService);
    await usersService.seedAdminUser();
  } catch (error) {
    if (error.code !== '23505') {
      // Ignore duplicate user errors
      throw error;
    }
    logger.warn('Admin user already exists, skipping creation');
  }

  // const usersService = app.get(UsersService);
  // await usersService.seedAdminUser();

  // Global interceptors
  const reflector = app.get(Reflector);
  const responseService = app.get(ResponseService);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector), new ApiResponseInterceptor(responseService));

  // Global filters
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string[]>('CORS_ORIGINS') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger documentation (only in development)
  // if (NODE_ENV === 'development') {
  //   const config = new DocumentBuilder()
  //     .setTitle('API Documentation')
  //     .setDescription('API description')
  //     .setVersion('1.0')
  //     .addBearerAuth()
  //     .build();
  //   const document = SwaggerModule.createDocument(app, config);
  //   SwaggerModule.setup('api-docs', app, document);
  // }

  // Start application
  // await app.listen(PORT);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  logger.log(`Application running on port ${PORT} in ${NODE_ENV} mode`);
}

bootstrap().catch((err) => {
  console.error('Application failed to start', err);
  process.exit(1);
});

// /* eslint-disable prettier/prettier */
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';
// import { ResponseService } from './common/services/response.service';
// import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
// import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import * as bodyParser from 'body-parser';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Get instance of ResponseService
//   const responseService = app.get(ResponseService);

//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));

//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   // Add ClassSerializerInterceptor globally (along with ApiResponseInterceptor)
//   app.useGlobalInterceptors(
//     new ClassSerializerInterceptor(app.get(Reflector)),
//     new ApiResponseInterceptor(responseService),
//   );

//   app.useGlobalFilters(new TypeOrmExceptionFilter());

//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();
