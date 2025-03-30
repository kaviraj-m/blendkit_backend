import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndexes1743358000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes to improve query performance
        
        // User indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_sin_number ON users (sin_number)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_name ON users (name)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_department_id ON users (department_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_college_id ON users (college_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id)`);
        
        // Department indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_departments_college_id ON departments (college_id)`);
        
        // Attendance indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendances ("userId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON attendances ("checkInTime")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes when migration is reverted
        
        // User indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_sin_number`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_name`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_department_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_college_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role_id`);
        
        // Department indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_departments_college_id`);
        
        // Attendance indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_attendance_user_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_attendance_check_in_time`);
    }
} 