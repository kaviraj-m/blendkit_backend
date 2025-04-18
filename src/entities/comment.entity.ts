import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { SocialPost } from './social-post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @ManyToOne(() => SocialPost, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  post: SocialPost;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  @Index()
  user: User;

  // Self-referencing relationship for threaded comments
  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  @Index()
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 