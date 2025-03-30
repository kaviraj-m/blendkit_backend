import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';

@Entity('colleges')
export class College {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 100 })
  website: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.college)
  users: User[];

  @OneToMany(() => Department, department => department.college)
  departments: Department[];
} 