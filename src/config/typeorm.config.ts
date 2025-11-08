// src/config/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { TypeOrmLogger } from 'src/common/typeorm-logger';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    // ✅ ALWAYS false in production, optional in development
    const synchronize = configService.get<boolean>('DB_SYNCHRONIZE') || !isProduction;

    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: synchronize, // ✅ Controlled by environment
        logging: !isProduction,
        logger: new TypeOrmLogger(),
        retryAttempts: 5,
        retryDelay: 3000,
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations',
        ssl: { rejectUnauthorized: false },
      };
    } else {
      return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'postgres',
        database: configService.get<string>('DB_NAME') || configService.get<string>('DB_DATABASE') || 'postgres',
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: synchronize, // ✅ Controlled by environment
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
