import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('day_scholar_hostellers')
export class DayScholarHosteller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  type: string;

  @Column({ nullable: true, length: 20 })
  parent_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.dayScholarHosteller)
  users: User[];
} 