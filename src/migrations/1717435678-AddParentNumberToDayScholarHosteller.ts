import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentNumberToDayScholarHosteller1717435678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "day_scholar_hostellers" 
      ADD COLUMN IF NOT EXISTS "parent_number" VARCHAR(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "day_scholar_hostellers" 
      DROP COLUMN IF EXISTS "parent_number"
    `);
  }
} 