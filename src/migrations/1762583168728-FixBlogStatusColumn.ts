import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixBlogStatusColumn1762583168728 implements MigrationInterface {
  name = 'FixBlogStatusColumn1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Check current status values
    console.log('Checking current status values...');

    // Step 2: Convert all NULL values to true (published)
    await queryRunner.query(`UPDATE blogs SET status = true WHERE status IS NULL`);

    // Step 3: Convert string values to boolean
    await queryRunner.query(
      `UPDATE blogs SET status = true WHERE status = 'true' OR status = 'published' OR status = '1'`,
    );
    await queryRunner.query(
      `UPDATE blogs SET status = false WHERE status = 'false' OR status = 'draft' OR status = '0'`,
    );

    // Step 4: Make column NOT NULL with default true
    await queryRunner.query(`ALTER TABLE blogs ALTER COLUMN status SET DEFAULT true`);
    await queryRunner.query(`ALTER TABLE blogs ALTER COLUMN status SET NOT NULL`);

    console.log('Blog status column fixed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    await queryRunner.query(`ALTER TABLE blogs ALTER COLUMN status DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE blogs ALTER COLUMN status DROP DEFAULT`);
  }
}
