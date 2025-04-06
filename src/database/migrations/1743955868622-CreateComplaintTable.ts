import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateComplaintTable1743955868622 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the table already exists
        const tableExists = await queryRunner.hasTable('complaint');
        if (!tableExists) {
            await queryRunner.query(`
                CREATE TABLE "complaint" (
                    "id" SERIAL PRIMARY KEY,
                    "student_id" INTEGER NOT NULL,
                    "subject" VARCHAR(255) NOT NULL,
                    "message" TEXT NOT NULL,
                    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
                    "reply" TEXT,
                    "director_id" INTEGER,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "fk_student_complaint" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_director_complaint" FOREIGN KEY ("director_id") REFERENCES "users"("id") ON DELETE SET NULL
                )
            `);
            
            // Add indexes for better performance
            await queryRunner.query(`CREATE INDEX "idx_complaint_student_id" ON "complaint"("student_id")`);
            await queryRunner.query(`CREATE INDEX "idx_complaint_status" ON "complaint"("status")`);
            await queryRunner.query(`CREATE INDEX "idx_complaint_created_at" ON "complaint"("created_at")`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_complaint_student_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_complaint_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_complaint_created_at"`);
        
        // Drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS "complaint"`);
    }
}
