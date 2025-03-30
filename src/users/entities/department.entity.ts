import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { College } from './college.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 10 })
  code: string; // Department code like CSE, ECE, etc.

  @Column({ nullable: true, length: 255 })
  description: string;

  @ManyToOne(() => College, college => college.departments)
  @JoinColumn({ name: 'college_id' })
  college: College;

  @Column()
  college_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.department)
  users: User[];
} 