import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  mediaUrls: string[];

  @Column({ nullable: true })
  @Index()
  category: string; // e.g., 'event', 'announcement', 'general', 'academic', 'question'

  @Column({ 
    nullable: false,
    default: 'public'
  })
  visibility: string; // 'public', 'department', 'batch', etc.

  @Column({ default: 0 })
  endorsementCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn() 
  createdBy: User;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 