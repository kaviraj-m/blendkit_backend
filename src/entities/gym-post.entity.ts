import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('gym_posts')
export class GymPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ 
    nullable: false,
    default: 'average'
  })
  bodyType: string; // e.g., 'lean', 'athletic', 'muscular', 'average', 'other'

  @Column({ 
    nullable: false,
    default: 'strength'
  })
  exerciseType: string; // e.g., 'strength', 'cardio', 'flexibility', 'balance', 'sports'

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn() // Let TypeORM handle the column name based on naming strategy
  createdBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 