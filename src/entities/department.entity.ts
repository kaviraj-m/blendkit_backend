import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { College } from './college.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 20, nullable: true })
  code: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ name: 'college_id' })
  college_id: number;

  @ManyToOne(() => College, college => college.departments)
  @JoinColumn({ name: 'college_id' })
  college: College;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.department)
  users: User[];
} 