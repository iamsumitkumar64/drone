import { UserEntity } from '../../../domain/user/user.entity.js';
import { ProductEntity } from '../../../domain/product/product.entity.js';
import { WatchlistEntity } from '../../../domain/watchlist/watchlist.entity.js';
import { StockHistoryEntity } from '../../../domain/stock-history/stock-history.entity.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';
import { ProductCategoryEnum } from '../../../domain/product/enum/product-category.enum.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { BcryptService } from '../../service/bcrypt/bcrypt.service.js';
import { dataSource } from '../config/orm-config.js';
import { ConfigService } from '@nestjs/config';

const users = [
    {
        uuid: 'c0a80101-7b1d-4a9f-8c1a-123456789001',
        email: 'user1@gmail.com',
        username: 'drone_builder_1',
        created_at: new Date('2025-01-01T00:00:00.000Z'),
    },
    {
        uuid: 'c0a80102-7b1d-4a9f-8c1a-123456789002',
        email: 'user2@gmail.com',
        username: 'drone_builder_2',
        created_at: new Date('2025-01-02T00:00:00.000Z'),
    },
];

const seedProducts = [
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000001',
        title: 'Raspberry Pi 5 8GB RAM Single Board Computer',
        url: 'https://robu.in/product/raspberry-pi-5-8gb/',
        retailer: RetailerEnum.ROBU,
        category: ProductCategoryEnum.RASPBERRY_PI,
        stockStatus: StockStatusEnum.IN_STOCK,
        currentPrice: 7499.00,
        currency: 'INR',
        specs: {
            RAM: '8GB LPDDR4X-4267',
            Processor: 'Broadcom BCM2712 Quad-Core Cortex-A76 @ 2.4GHz',
            PCIe: 'PCIe 2.0 x1 interface for NVMe SSD',
            Video: 'Dual 4Kp60 micro-HDMI',
            Wireless: '2.4GHz/5.0GHz 802.11ac Wi-Fi, Bluetooth 5.0 / BLE',
        },
        description: 'Next-generation single-board computer featuring 2-3x speedup, dual 4K display output, and PCIe 2.0 connector ideal for drone companion computer applications.',
        imageUrl: 'https://robu.in/wp-content/uploads/2023/09/Raspberry-Pi-5-8GB-1.jpg',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000002',
        title: 'Raspberry Pi 5 M.2 NVMe HAT+ High Speed Carrier Board',
        url: 'https://thinkrobotics.com/products/raspberry-pi-m-2-hat',
        retailer: RetailerEnum.THINKROBOTICS,
        category: ProductCategoryEnum.HAT,
        stockStatus: StockStatusEnum.IN_STOCK,
        currentPrice: 1399.00,
        currency: 'INR',
        specs: {
            Compatibility: 'Raspberry Pi 5',
            FormFactor: 'M.2 M-key 2230 and 2242 NVMe SSDs',
            Throughput: 'PCIe 2.0 (up to 500 MB/s) / PCIe 3.0 enabled',
            Power: 'Supplies up to 3A to connected M.2 drive',
        },
        description: 'Official Raspberry Pi M.2 HAT+ allows connecting fast NVMe solid state drives to Raspberry Pi 5 for high-speed edge video logging on autonomous drones.',
        imageUrl: 'https://thinkrobotics.com/cdn/shop/files/RaspberryPiM.2HAT_1.png',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000003',
        title: 'Holybro Pixhawk 6X Autopilot Flight Controller Standard Baseboard',
        url: 'https://robu.in/product/holybro-pixhawk-6x-standard-autopilot/',
        retailer: RetailerEnum.ROBU,
        category: ProductCategoryEnum.FLIGHT_CONTROLLER,
        stockStatus: StockStatusEnum.OUT_OF_STOCK,
        currentPrice: 36999.00,
        currency: 'INR',
        specs: {
            Processor: 'STM32H753 32-bit Arm Cortex-M7 480MHz',
            FailsafeProcessor: 'STM32F100 32-bit Arm Cortex-M3',
            IMUs: 'Triple redundant: ICM-42688-P, ICM-45686, BMI088',
            Barometers: 'Dual ICP-20100 & BMP388',
            Firmware: 'PX4 Autopilot & ArduPilot supported',
            Ethernet: 'High-speed Ethernet port for ROS2/Companion integration',
        },
        description: 'Industrial modular flight controller designed according to Pixhawk FMUv6X open standard, featuring vibration-isolated triple IMU redundancy and high-speed companion bus.',
        imageUrl: 'https://robu.in/wp-content/uploads/2022/10/Holybro-Pixhawk-6X-Baseboard-1.jpg',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000004',
        title: 'Holybro Pixhawk 6X Flight Controller with PM02D Power Module',
        url: 'https://evelta.com/holybro-pixhawk-6x-flight-controller/',
        retailer: RetailerEnum.EVELTA,
        category: ProductCategoryEnum.FLIGHT_CONTROLLER,
        stockStatus: StockStatusEnum.PRE_ORDER,
        currentPrice: 39500.00,
        currency: 'INR',
        specs: {
            Processor: 'STM32H753 480MHz',
            PowerModule: 'PM02D digital I2C power module with battery monitoring',
            Status: 'Accepting pre-orders for batch shipment',
        },
        description: 'Complete industrial autopilot bundle with digital PM02D power module and telemetry connectors for enterprise UAV builders.',
        imageUrl: 'https://evelta.com/images/pixhawk6x.jpg',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000005',
        title: 'SpeedyBee F405 V4 55A BLS 30x30 Flight Controller Stack',
        url: 'https://zbotic.in/product/speedybee-f405-v4-55a-stack/',
        retailer: RetailerEnum.ZBOTIC,
        category: ProductCategoryEnum.FLIGHT_CONTROLLER,
        stockStatus: StockStatusEnum.IN_STOCK,
        currentPrice: 5499.00,
        currency: 'INR',
        specs: {
            MCU: 'STM32F405',
            Gyro: 'BMI270',
            ESC: '55A 4-in-1 BLHeli_S DShot300/600',
            Bluetooth: 'Wireless configuration via SpeedyBee App',
            OSD: 'AT7456E analog OSD chip',
        },
        description: 'Budget-friendly high-performance stack for FPV and mapping drones with wireless Bluetooth tuning directly from your mobile smartphone.',
        imageUrl: 'https://zbotic.in/wp-content/uploads/2023/11/Speedybee-F405-V4.jpg',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000006',
        title: 'Radxa Zero 3W Companion Computer 4GB RAM WiFi/BT',
        url: 'https://thinkrobotics.com/products/radxa-zero-3w-4gb',
        retailer: RetailerEnum.THINKROBOTICS,
        category: ProductCategoryEnum.COMPANION_COMPUTER,
        stockStatus: StockStatusEnum.IN_STOCK,
        currentPrice: 3199.00,
        currency: 'INR',
        specs: {
            SoC: 'Rockchip RK3566 Quad-Core Cortex-A55',
            NPU: '0.8 TOPS AI accelerator for edge computer vision',
            RAM: '4GB LPDDR4',
            Dimensions: '65mm x 30mm ultralight form factor (12 grams)',
        },
        description: 'Ultra-compact companion computer offering 0.8 TOPS neural processing unit, perfect for lightweight aerial robots with obstacle avoidance.',
        imageUrl: 'https://thinkrobotics.com/cdn/shop/files/RadxaZero3W_1.jpg',
    },
    {
        uuid: 'd0a80101-7b1d-4a9f-8c1a-000000000007',
        title: 'Waveshare PoE+ HAT for Raspberry Pi 5 with Cooling Fan',
        url: 'https://robu.in/product/waveshare-poe-plus-hat-pi5/',
        retailer: RetailerEnum.ROBU,
        category: ProductCategoryEnum.HAT,
        stockStatus: StockStatusEnum.OUT_OF_STOCK,
        currentPrice: 2199.00,
        currency: 'INR',
        specs: {
            Standard: 'IEEE 802.3af/at Power over Ethernet',
            Output: '5V 4.5A (22.5W)',
            Fan: 'Active PWM controllable cooling fan onboard',
        },
        description: 'Power over Ethernet HAT providing power and network over a single Cat6 cable for tethered drone and surveillance operations.',
        imageUrl: 'https://robu.in/wp-content/uploads/2023/12/Waveshare-PoE-HAT-Pi5.jpg',
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
        // Seed users
        for (const user of users) {
            await queryRunner.manager.save(UserEntity, {
                uuid: user.uuid,
                email: user.email,
                password: hashedPassword,
                username: user.username,
            });
        }
        console.info('✅ Users seeded successfully');

        // Seed products
        for (const product of seedProducts) {
            await queryRunner.manager.save(ProductEntity, {
                ...product,
                lastCheckedAt: new Date(),
            } as any);
        }
        console.info('✅ Seed drone products created successfully');

        // Seed initial history
        await queryRunner.manager.save(StockHistoryEntity, {
            productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000003',
            oldStatus: StockStatusEnum.IN_STOCK,
            newStatus: StockStatusEnum.OUT_OF_STOCK,
            oldPrice: 34999.00,
            newPrice: 36999.00,
            changeReason: 'Supplier stock depleted across Indian warehouses',
        } as any);

        // Seed day-1 watchlist for users (Raspberry Pi 5, Pixhawk 6X, HATs)
        const watchlistSeeds = [
            {
                userId: 'c0a80101-7b1d-4a9f-8c1a-123456789001',
                productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000001', // Raspberry Pi 5
                notifyTelegram: true,
                notifyWeb: true,
            },
            {
                userId: 'c0a80101-7b1d-4a9f-8c1a-123456789001',
                productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000003', // Holybro Pixhawk 6X
                notifyTelegram: true,
                notifyWeb: true,
            },
            {
                userId: 'default-user',
                productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000003', // Pixhawk 6X
                notifyTelegram: true,
                notifyWeb: true,
            },
            {
                userId: 'default-user',
                productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000001', // Pi 5
                notifyTelegram: true,
                notifyWeb: true,
            },
            {
                userId: 'default-user',
                productUuid: 'd0a80101-7b1d-4a9f-8c1a-000000000002', // Pi 5 M.2 HAT
                notifyTelegram: true,
                notifyWeb: true,
            },
        ];

        for (const item of watchlistSeeds) {
            await queryRunner.manager.save(WatchlistEntity, item as any);
        }
        console.info('✅ Day-1 Watchlist items seeded successfully');

        await queryRunner.commitTransaction();
        console.info('🎉 All seeds completed successfully!');
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Something went wrong during seeding:', error);
    } finally {
        await queryRunner.release();
        await dataSource.destroy();
    }
}

void create();