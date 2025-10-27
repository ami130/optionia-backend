/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { TypeOrmLogger } from 'src/common/typeorm-logger';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST') || 'localhost',
      port: configService.get<number>('DB_PORT') || 5432,
      username: configService.get<string>('DB_USERNAME') || 'postgres',
      password: configService.get<string>('DB_PASSWORD') || 'postgres',
      database: configService.get<string>('DB_DATABASE') || 'postgres',
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: !isProduction,
      logger: new TypeOrmLogger(),
      retryAttempts: 5,
      retryDelay: 3000,
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false, // 🔥 Disable SSL for localhost
    };
  },
};

// /* eslint-disable prettier/prettier */
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
// import { TypeOrmLogger } from 'src/common/typeorm-logger';

// // src/config/typeorm.config.ts
// export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
//   inject: [ConfigService],
//   useFactory: (configService: ConfigService) => ({
//     type: 'postgres',
//     host: configService.get<string>('DB_HOST'),
//     port: configService.get<number>('DB_PORT'),
//     username: configService.get<string>('DB_USERNAME'),
//     password: configService.get<string>('DB_PASSWORD'),
//     database: configService.get<string>('DB_DATABASE'),
//     entities: [__dirname + '/../**/*.entity.{js,ts}'],
//     synchronize: configService.get<string>('NODE_ENV') !== 'production',
//     logger: new TypeOrmLogger(),
//     ssl: false, // Enable SSL
//     extra: {
//       ssl: {
//         rejectUnauthorized: false, // Required for Render.com
//       },
//     },
//     retryAttempts: 5,
//     retryDelay: 3000,
//   }),
// };

// export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
//   inject: [ConfigService],
//   useFactory: (configService: ConfigService) => ({
//     type: 'postgres',
//     host: configService.get<string>('DB_HOST'),
//     port: configService.get<number>('DB_PORT'),
//     username: configService.get<string>('DB_USERNAME'),
//     password: configService.get<string>('DB_PASSWORD'),
//     database: configService.get<string>('DB_DATABASE'),
//     entities: [__dirname + '/../**/*.entity.{js,ts}'],
//     synchronize: configService.get<string>('NODE_ENV') !== 'production',
//     logger: new TypeOrmLogger(),
//     retryAttempts: 5,
//     retryDelay: 3000,
//     // ssl: true,
//     // extra: {
//     //   ssl: {
//     //     rejectUnauthorized: false,
//     //   },
//     // },
//   }),
// };
