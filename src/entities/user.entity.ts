import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';
import { Quota } from './quota.entity';
import { DayScholarHosteller } from './day-scholar-hosteller.entity';
import { College } from './college.entity';
import { Department } from './department.entity';
import { Attendance } from './attendance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  @Index()
  sin_number: string; // Student identification number

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({ length: 100, nullable: true })
  father_name: string;

  @Column({ nullable: true })
  year: number; // Current year of study

  @Column({ length: 20, nullable: true })
  batch: string; // Batch/graduation year

  @Column({ length: 15, nullable: true })
  phone: string;

  // Foreign key relationships
  @ManyToOne(() => Department, department => department.users)
  @JoinColumn({ name: 'department_id' })
  @Index()
  department: Department;

  @Column()
  department_id: number;

  @ManyToOne(() => College, college => college.users)
  @JoinColumn({ name: 'college_id' })
  @Index()
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
  @Index()
  role: Role;

  @Column()
  role_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Gym management relations
  @OneToMany(() => Attendance, attendance => attendance.user)
  attendances: Attendance[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
} 