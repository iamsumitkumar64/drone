// import { faker } from '@faker-js/faker';
import { UserEntity } from '../../../domain/user/user.entity.js';
import { BcryptService } from '../../service/bcrypt/bcrypt.service.js';
import { dataSource } from '../config/orm-config.js';
import { ConfigService } from '@nestjs/config';

// hardcoded users for all microservices
const users = [
    {
        uuid: 'c0a80101-7b1d-4a9f-8c1a-123456789001',
        email: 'user1@gmail.com',
        username: 'user 1',
        created_at: new Date('2025-01-01T00:00:00.000Z'),
    },
    {
        uuid: 'c0a80102-7b1d-4a9f-8c1a-123456789002',
        email: 'user2@gmail.com',
        username: 'user 2',
        created_at: new Date('2025-01-02T00:00:00.000Z'),
    },
];

async function create() {
    await dataSource.initialize();

    const configService = new ConfigService();
    const bcryptService = new BcryptService(configService);
    const hashedPassword = await bcryptService.hashPassword("123");

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars

        // use same users across all services
        for (const user of users) {
            const created_user = await queryRunner.manager.save(UserEntity, {
                uuid: user.uuid,
                email: user.email,// faker.internet.email(),
                password: hashedPassword,
                username: user.username,// faker.person.fullName(),
            });

            console.log(created_user);
        }

        await queryRunner.commitTransaction();
        console.info('✅ Seeded successfully');
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Something went wrong:', error);
    } finally {
        await queryRunner.release();
        await dataSource.destroy();
    }
}

void create();