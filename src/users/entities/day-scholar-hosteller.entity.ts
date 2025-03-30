import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('day_scholar_hosteller')
export class DayScholarHosteller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  type: string; // 'Day Scholar' or 'Hosteller'

  @Column({ nullable: true, length: 255 })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.dayScholarHosteller)
  users: User[];
} 