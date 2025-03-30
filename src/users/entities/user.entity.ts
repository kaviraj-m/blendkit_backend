import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';
import { Quota } from './quota.entity';
import { DayScholarHosteller } from './day-scholar-hosteller.entity';
import { College } from './college.entity';
import { Department } from './department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  sin_number: string; // Student identification number

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, length: 100 })
  father_name: string;

  @Column({ nullable: true })
  year: number; // Current year of study

  @Column({ nullable: true, length: 20 })
  batch: string; // Batch/graduation year

  @Column({ nullable: true, length: 15 })
  phone: string;

  // Foreign key relationships
  @ManyToOne(() => Department, department => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  department_id: number;

  @ManyToOne(() => College, college => college.users)
  @JoinColumn({ name: 'college_id' })
  college: College;

  @Column()
  college_id: number;

  @ManyToOne(() => DayScholarHosteller, dayScholarHosteller => dayScholarHosteller.users)
  @JoinColumn({ name: 'dayscholar_hosteller_id' })
  dayScholarHosteller: DayScholarHosteller;

  @Column()
  dayscholar_hosteller_id: number;

  @ManyToOne(() => Quota, quota => quota.users)
  @JoinColumn({ name: 'quota_id' })
  quota: Quota;

  @Column()
  quota_id: number;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  role_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
} 