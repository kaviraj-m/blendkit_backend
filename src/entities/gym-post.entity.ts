import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('gym_posts')
export class GymPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  bodyType: string; // e.g., 'slim', 'muscular', 'weight-loss', etc.

  @Column({ nullable: true })
  exerciseType: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 