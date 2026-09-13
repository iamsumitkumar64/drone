import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UserMigration1777275281000 implements MigrationInterface {
    name = "UserMigration1777275281000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(
            `CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'company')`
        );

        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    { name: "uuid", type: "uuid", isPrimary: true, isGenerated: false, default: "uuid_generate_v4()" },
                    { name: "username", type: "varchar", isNullable: false },
                    { name: "email", type: "varchar", isUnique: true, isNullable: false },
                    { name: "password", type: "varchar", isNullable: true },
                    { name: "role", type: "user_role_enum", default: `'user'`, isNullable: false },
                    { name: "created_at", type: "timestamp", default: "now()" },
                    { name: "updated_at", type: "timestamp", default: "now()" },
                    { name: "deleted_at", type: "timestamp", isNullable: true },
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user", true);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
    }
}