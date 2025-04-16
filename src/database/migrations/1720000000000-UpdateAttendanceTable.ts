import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttendanceTable1720000000000 implements MigrationInterface {
  name = 'UpdateAttendanceTable1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add enum types first
    await queryRunner.query(`
      CREATE TYPE "public"."workout_type_enum" AS ENUM(
        'cardio',
        'strength',
        'flexibility',
        'mixed',
        'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."workout_completion_status_enum" AS ENUM(
        'completed',
        'partial',
        'not_completed',
        'cancelled'
      )
    `);

    // Add new columns to attendances table
    await queryRunner.query(`
      ALTER TABLE "attendances" 
      ADD COLUMN IF NOT EXISTS "workout_type" workout_type_enum NULL,
      ADD COLUMN IF NOT EXISTS "planned_duration" integer NULL,
      ADD COLUMN IF NOT EXISTS "actual_duration" integer NULL,
      ADD COLUMN IF NOT EXISTS "is_first_visit" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "completion_status" workout_completion_status_enum NULL,
      ADD COLUMN IF NOT EXISTS "staff_observations" text NULL,
      ADD COLUMN IF NOT EXISTS "workout_intensity" integer NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns first
    await queryRunner.query(`
      ALTER TABLE "attendances" 
      DROP COLUMN IF EXISTS "workout_type",
      DROP COLUMN IF EXISTS "planned_duration",
      DROP COLUMN IF EXISTS "actual_duration",
      DROP COLUMN IF EXISTS "is_first_visit",
      DROP COLUMN IF EXISTS "completion_status",
      DROP COLUMN IF EXISTS "staff_observations",
      DROP COLUMN IF EXISTS "workout_intensity"
    `);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."workout_completion_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."workout_type_enum"`);
  }
} 