// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

export type UserRole = 'ADMIN' | 'USER';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  lastname: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', default: '' })
  mobile: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true, select: false })
  password: string | null;

  @Column({ type: 'text', default: 'user' })
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  provider: string | null;

  @Column({ type: 'text', nullable: true })
  providerId: string | null;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
