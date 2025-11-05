// src/config/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { TypeOrmLogger } from 'src/common/typeorm-logger';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    // For Render, use DATABASE_URL if available, otherwise fall back to individual vars
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (databaseUrl) {
      // Use DATABASE_URL (Render provides this)
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: !isProduction, // false in production for safety
        logging: !isProduction,
        logger: new TypeOrmLogger(),
        retryAttempts: 5,
        retryDelay: 3000,
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations',
        ssl: { rejectUnauthorized: false }, // Always use SSL for Render
      };
    } else {
      // Use individual connection parameters (for local development)
      return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'postgres',
        database: configService.get<string>('DB_NAME') || configService.get<string>('DB_DATABASE') || 'postgres', // Support both DB_NAME and DB_DATABASE
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: !isProduction,
        logging: !isProduction,
        logger: new TypeOrmLogger(),
        retryAttempts: 5,
        retryDelay: 3000,
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations',
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      };
    }
  },
};

// /* eslint-disable prettier/prettier */
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
// import { TypeOrmLogger } from 'src/common/typeorm-logger';

// export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
//   inject: [ConfigService],
//   useFactory: (configService: ConfigService) => {
//     const isProduction = configService.get<string>('NODE_ENV') === 'production';
//     return {
//       type: 'postgres',
//       host: configService.get<string>('DB_HOST') || 'localhost',
//       port: configService.get<number>('DB_PORT') || 5432,
//       username: configService.get<string>('DB_USERNAME') || 'postgres',
//       password: configService.get<string>('DB_PASSWORD') || 'postgres',
//       database: configService.get<string>('DB_DATABASE') || 'postgres',
//       entities: [__dirname + '/../**/*.entity.{js,ts}'],
//       synchronize: !isProduction,
//       logger: new TypeOrmLogger(),
//       retryAttempts: 5,
//       retryDelay: 3000,
//       ssl: isProduction
//         ? {
//             rejectUnauthorized: false,
//           }
//         : false, // 🔥 Disable SSL for localhost
//       migrations: ['src/migrations/*.ts'],
//       migrationsTableName: 'migrations',
//     };
//   },
// };
