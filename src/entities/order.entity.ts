import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../orders/order-status.enum';
import { User } from '../entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: string; // store as string from TypeORM decimal

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string | null; // e.g. 'card', 'cash'

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
