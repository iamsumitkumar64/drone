import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockStatusEnum } from '../product/enum/stock-status.enum.js';

@Entity('stock_history')
export class StockHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid', nullable: false })
  productUuid: string;

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

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @CreateDateColumn()
  created_at: Date;
}
