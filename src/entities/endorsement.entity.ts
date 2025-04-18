import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';
import { SocialPost } from './social-post.entity';

@Entity('endorsements')
@Unique(['post', 'user']) // A user can only endorse a post once
export class Endorsement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SocialPost, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  post: SocialPost;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  @Index()
  user: User;
  
  @Column({ length: 50, nullable: false })
  userRole: string; // Store the user's role at the time of endorsement

  @CreateDateColumn()
  createdAt: Date;
} 