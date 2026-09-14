import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('watchlist')
export class WatchlistEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string; // Supports user UUID or Telegram chat ID

  @Column({ type: 'uuid', nullable: false })
  productUuid: string;

  @Column({ type: 'boolean', default: true })
  notifyTelegram: boolean;

  @Column({ type: 'boolean', default: true })
  notifyWeb: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetPrice: number;

  @CreateDateColumn()
  created_at: Date;
}
