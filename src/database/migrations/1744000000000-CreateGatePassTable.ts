import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGatePassTable1744000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum types
    await queryRunner.query(`
      CREATE TYPE "gate_pass_status_enum" AS ENUM (
        'pending_staff',
        'approved_by_staff',
        'rejected_by_staff',
        'pending_hod',
        'approved_by_hod',
        'rejected_by_hod',
        'pending_hostel_warden',
        'approved_by_hostel_warden',
        'rejected_by_hostel_warden',
        'pending_academic_director',
        'approved',
        'rejected_by_academic_director',
        'used',
        'expired'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "gate_pass_type_enum" AS ENUM (
        'leave',
        'home_visit',
        'emergency',
        'other'
      )
    `);

    // Create the gate pass table
    await queryRunner.query(`
      CREATE TABLE "gate_passes" (
        "id" SERIAL PRIMARY KEY,
        "student_id" INTEGER NOT NULL,
        "department_id" INTEGER NOT NULL,
        "staff_id" INTEGER,
        "hod_id" INTEGER,
        "hostel_warden_id" INTEGER,
        "academic_director_id" INTEGER,
        "security_id" INTEGER,
        "status" gate_pass_status_enum NOT NULL DEFAULT 'pending_staff',
        "type" gate_pass_type_enum NOT NULL DEFAULT 'other',
        "reason" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "start_date" TIMESTAMP,
        "end_date" TIMESTAMP,
        "staff_comment" TEXT,
        "hod_comment" TEXT,
        "hostel_warden_comment" TEXT,
        "academic_director_comment" TEXT,
        "security_comment" TEXT,
        "checkout_time" TIMESTAMP,
        "checkin_time" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_student_gate_pass" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_department_gate_pass" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_staff_gate_pass" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_hod_gate_pass" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_hostel_warden_gate_pass" FOREIGN KEY ("hostel_warden_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_academic_director_gate_pass" FOREIGN KEY ("academic_director_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_security_gate_pass" FOREIGN KEY ("security_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Add indexes for better performance
    await queryRunner.query(`CREATE INDEX "idx_gate_pass_student_id" ON "gate_passes"("student_id")`);
    await queryRunner.query(`CREATE INDEX "idx_gate_pass_department_id" ON "gate_passes"("department_id")`);
    await queryRunner.query(`CREATE INDEX "idx_gate_pass_status" ON "gate_passes"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_gate_pass_start_date" ON "gate_passes"("start_date")`);
    await queryRunner.query(`CREATE INDEX "idx_gate_pass_end_date" ON "gate_passes"("end_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gate_pass_student_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gate_pass_department_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gate_pass_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gate_pass_start_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gate_pass_end_date"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "gate_passes"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "gate_pass_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gate_pass_type_enum"`);
  }
} 