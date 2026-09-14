import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class DroneAssistantMigration1777275282000 implements MigrationInterface {
    name = "DroneAssistantMigration1777275282000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."retailer_enum" AS ENUM('robu.in', 'thinkrobotics.com', 'zbotic.in', 'evelta.com', 'other')`
        );

        await queryRunner.query(
            `CREATE TYPE "public"."product_category_enum" AS ENUM('raspberry_pi', 'flight_controller', 'companion_computer', 'hat', 'general')`
        );

        await queryRunner.query(
            `CREATE TYPE "public"."stock_status_enum" AS ENUM('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'UNKNOWN')`
        );

        // Product Table
        await queryRunner.createTable(
            new Table({
                name: "product",
                columns: [
                    { name: "uuid", type: "uuid", isPrimary: true, isGenerated: false, default: "uuid_generate_v4()" },
                    { name: "title", type: "varchar", isNullable: false },
                    { name: "url", type: "varchar", isUnique: true, isNullable: false },
                    { name: "retailer", type: "retailer_enum", default: `'other'`, isNullable: false },
                    { name: "category", type: "product_category_enum", default: `'general'`, isNullable: false },
                    { name: "stockStatus", type: "stock_status_enum", default: `'UNKNOWN'`, isNullable: false },
                    { name: "currentPrice", type: "decimal", precision: 10, scale: 2, default: 0, isNullable: false },
                    { name: "currency", type: "varchar", default: `'INR'`, isNullable: false },
                    { name: "specs", type: "jsonb", default: `'{}'`, isNullable: false },
                    { name: "description", type: "text", isNullable: true },
                    { name: "imageUrl", type: "text", isNullable: true },
                    { name: "lastCheckedAt", type: "timestamp", isNullable: true },
                    { name: "created_at", type: "timestamp", default: "now()" },
                    { name: "updated_at", type: "timestamp", default: "now()" },
                    { name: "deleted_at", type: "timestamp", isNullable: true },
                ]
            }),
            true
        );

        // Stock History Table
        await queryRunner.createTable(
            new Table({
                name: "stock_history",
                columns: [
                    { name: "uuid", type: "uuid", isPrimary: true, isGenerated: false, default: "uuid_generate_v4()" },
                    { name: "productUuid", type: "uuid", isNullable: false },
                    { name: "oldStatus", type: "stock_status_enum", isNullable: true },
                    { name: "newStatus", type: "stock_status_enum", isNullable: false },
                    { name: "oldPrice", type: "decimal", precision: 10, scale: 2, isNullable: true },
                    { name: "newPrice", type: "decimal", precision: 10, scale: 2, isNullable: true },
                    { name: "changeReason", type: "text", isNullable: true },
                    { name: "created_at", type: "timestamp", default: "now()" },
                ]
            }),
            true
        );

        // Watchlist Table
        await queryRunner.createTable(
            new Table({
                name: "watchlist",
                columns: [
                    { name: "uuid", type: "uuid", isPrimary: true, isGenerated: false, default: "uuid_generate_v4()" },
                    { name: "userId", type: "varchar", isNullable: false },
                    { name: "productUuid", type: "uuid", isNullable: false },
                    { name: "notifyTelegram", type: "boolean", default: true, isNullable: false },
                    { name: "notifyWeb", type: "boolean", default: true, isNullable: false },
                    { name: "targetPrice", type: "decimal", precision: 10, scale: 2, isNullable: true },
                    { name: "created_at", type: "timestamp", default: "now()" },
                ]
            }),
            true
        );

        // Alert Table
        await queryRunner.createTable(
            new Table({
                name: "alert",
                columns: [
                    { name: "uuid", type: "uuid", isPrimary: true, isGenerated: false, default: "uuid_generate_v4()" },
                    { name: "productUuid", type: "uuid", isNullable: false },
                    { name: "channel", type: "varchar", default: `'TELEGRAM'`, isNullable: false },
                    { name: "recipient", type: "varchar", isNullable: false },
                    { name: "oldStatus", type: "stock_status_enum", isNullable: true },
                    { name: "newStatus", type: "stock_status_enum", isNullable: false },
                    { name: "oldPrice", type: "decimal", precision: 10, scale: 2, isNullable: true },
                    { name: "newPrice", type: "decimal", precision: 10, scale: 2, isNullable: true },
                    { name: "message", type: "text", isNullable: false },
                    { name: "status", type: "varchar", default: `'SENT'`, isNullable: false },
                    { name: "sentAt", type: "timestamp", default: "now()" },
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("alert", true);
        await queryRunner.dropTable("watchlist", true);
        await queryRunner.dropTable("stock_history", true);
        await queryRunner.dropTable("product", true);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."stock_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."retailer_enum"`);
    }
}
