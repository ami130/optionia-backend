// src/migrations/migration.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private dataSource: DataSource) {}

  async runMigrations(): Promise<void> {
    try {
      this.logger.log('🔄 Running database migrations...');

      // Show pending migrations
      const pendingMigrations = await this.dataSource.showMigrations();
      this.logger.log(`📋 Pending migrations: ${pendingMigrations}`);

      // Run migrations
      const migrations = await this.dataSource.runMigrations();

      if (migrations.length > 0) {
        this.logger.log(`✅ Applied ${migrations.length} migrations:`);
        migrations.forEach((migration) => {
          this.logger.log(`   - ${migration.name}`);
        });
      } else {
        this.logger.log('✅ No new migrations to apply');
      }
    } catch (error) {
      this.logger.error('❌ Migration failed:', error);
      throw error;
    }
  }
}
