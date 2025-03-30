import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToDayScholarHosteller1743357618937 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the description column already exists
        const hasColumn = await queryRunner.hasColumn('day_scholar_hostellers', 'description');
        
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "day_scholar_hostellers" ADD "description" character varying(255)`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "day_scholar_hostellers" DROP COLUMN "description"`);
    }
} 