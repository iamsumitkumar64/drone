import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockStatusEnum } from '../product/enum/stock-status.enum.js';

@Entity('alert')
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid', nullable: false })
  productUuid: string;

  @Column({ type: 'varchar', default: 'TELEGRAM' })
  channel: string; // TELEGRAM | WHATSAPP | WEBSOCKET

  @Column({ type: 'varchar', nullable: false })
  recipient: string;

  @Column({
    type: 'enum',
    enum: StockStatusEnum,
    nullable: true,
  })
  oldStatus: StockStatusEnum;

  @Column({
    type: 'enum',
    enum: StockStatusEnum,
    nullable: false,
  })
  newStatus: StockStatusEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  newPrice: number;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'varchar', default: 'SENT' })
  status: string; // SENT | FAILED

  @CreateDateColumn()
  sentAt: Date;
}
