// src/common/typeorm-logger.ts
import { Logger } from '@nestjs/common';
import { Logger as TypeORMLogger } from 'typeorm';

export class TypeOrmLogger implements TypeORMLogger {
  private readonly logger = new Logger('TypeORM');

  logQuery(query: string, parameters?: any[]) {
    this.logger.debug(`Query: ${query} Parameters: ${JSON.stringify(parameters)}`);
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    this.logger.error(`Error: ${error}, Query: ${query}, Parameters: ${JSON.stringify(parameters)}`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.logger.warn(`Slow query (${time}ms): ${query}, Parameters: ${JSON.stringify(parameters)}`);
  }

  logSchemaBuild(message: string) {
    this.logger.log(message);
  }

  logMigration(message: string) {
    this.logger.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    if (level === 'log') {
      this.logger.log(message);
    } else if (level === 'info') {
      this.logger.log(message);
    } else if (level === 'warn') {
      this.logger.warn(message);
    }
  }
}
