// src/auth/entities/refresh-token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../entities/user.entity'; // مسیر درست

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' }) // ✅ string صریح
  tokenHash: string;

  @Column({ type: 'datetime' }) // ✅ برای SQLite
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({ type: 'text', nullable: true }) // ✅ nullپذیر، نوع مشخص
  userAgent: string | null;

  @Column({ type: 'text', nullable: true }) // ✅ nullپذیر، نوع مشخص
  ip: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
