import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string; // e.g., 'General', 'OBC', 'SC', 'ST', etc.

  @Column({ nullable: true, length: 255 })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.quota)
  users: User[];
} 