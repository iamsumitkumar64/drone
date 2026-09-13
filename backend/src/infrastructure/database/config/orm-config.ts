import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const dataSourceOptions =
    (configService: ConfigService,): DataSourceOptions => (
        {
            type: (configService.get<string>('DB_POSTGRES_TYPE') as any) || 'postgres',
            host: configService.get<string>('DB_POSTGRES_HOST') || 'localhost',
            port: configService.get<number>('DB_POSTGRES_PORT') ? Number(configService.get('DB_POSTGRES_PORT')) : 5432,
            username: configService.get<string>('DB_POSTGRES_USERNAME') || 'postgres',
            password: configService.get<string>('DB_POSTGRES_PASSWORD') || '123',
            database: configService.get<string>('DB_POSTGRES_DATABASE') || 'db',
            logging: Boolean(configService.get<boolean>('DB_POSTGRES_LOGGING')) || false,
            entities: [
                path.join(
                    __dirname,
                    '../../../domain/**/*.entity.{js,ts}',
                ),
            ],
            synchronize: false,
            migrations:  [
                path.join(
                    __dirname,
                    '../migrations/*.{js,ts}',
                ),
            ],
        }
    );

const dataSource = new DataSource(
    dataSourceOptions(new ConfigService()),
);

export { dataSource };
