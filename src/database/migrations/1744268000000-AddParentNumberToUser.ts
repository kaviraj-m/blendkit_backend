import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentNumberToUser1744268000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_number" VARCHAR(15)`
    );
    
    // Set the parent_number for student users only
    await queryRunner.query(`
      UPDATE "users" 
      SET "parent_number" = '7904612266' 
      FROM "roles" 
      WHERE "users"."role_id" = "roles"."id" AND "roles"."name" = 'student'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "parent_number"`);
  }
} 