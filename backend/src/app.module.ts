import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { dataSource } from './infrastructure/database/config/orm-config.js';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/repository/user-repository/user-repository.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketModule } from './infrastructure/service/socket/socket.module.js';
import { AuthModule } from './feature/auth/auth.module.js';
import { DataSourceOptions } from 'typeorm';
import { ProductModule } from './feature/product/product.module.js';
import { WatchlistModule } from './feature/watchlist/watchlist.module.js';
import { MonitoringModule } from './feature/monitoring/monitoring.module.js';
import { ChatModule } from './feature/chat/chat.module.js';
import { createTransactionalDataSourceService } from './infrastructure/service/typeorm-transactional/typeorm-transactional.service.js';
import { BcryptService } from './infrastructure/service/bcrypt/bcrypt.service.js';
import { JwtHelperService } from './infrastructure/service/jwt/jwt.service.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticateGuard } from './infrastructure/guard/authenticate/authenticate.guard.js';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './infrastructure/cron/cron.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSource.options,
        retryAttempts: Number(configService.get('DB_RETRY_ATTEMPTS')) || 10,
        retryDelay: Number(configService.get('DB_RETRY_DELAY')) || 5000,
      }),
      dataSourceFactory: async (options) =>
        createTransactionalDataSourceService(
          options as DataSourceOptions,
        ),
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRE_IN') ?? '7d') as any,
        },
      }),
      global: true,
    }),

    // Features & Modules
    AuthModule,
    SocketModule,
    ProductModule,
    WatchlistModule,
    MonitoringModule,
    ChatModule,
    ScheduleModule.forRoot(),
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BcryptService,
    UserRepository,
    JwtHelperService,
    {
      provide: APP_GUARD,
      useClass: AuthenticateGuard,
    },
  ],
})
export class AppModule { }