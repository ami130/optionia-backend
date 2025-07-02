/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';
import { ResponseService } from './common/services/response.service';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get instance of ResponseService
  const responseService = app.get(ResponseService);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Add ClassSerializerInterceptor globally (along with ApiResponseInterceptor)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ApiResponseInterceptor(responseService),
  );

  app.useGlobalFilters(new TypeOrmExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
