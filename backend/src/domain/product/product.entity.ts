import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockStatusEnum } from './enum/stock-status.enum.js';
import { RetailerEnum } from './enum/retailer.enum.js';
import { ProductCategoryEnum } from './enum/product-category.enum.js';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  url: string;

  @Column({
    type: 'enum',
    enum: RetailerEnum,
    default: RetailerEnum.OTHER,
    nullable: false,
  })
  retailer: RetailerEnum;

  @Column({
    type: 'enum',
    enum: ProductCategoryEnum,
    default: ProductCategoryEnum.GENERAL,
    nullable: false,
  })
  category: ProductCategoryEnum;

  @Column({
    type: 'enum',
    enum: StockStatusEnum,
    default: StockStatusEnum.UNKNOWN,
    nullable: false,
  })
  stockStatus: StockStatusEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency: string;

  @Column({ type: 'jsonb', default: {} })
  specs: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
