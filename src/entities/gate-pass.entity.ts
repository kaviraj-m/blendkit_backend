import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';

export enum GatePassStatus {
  PENDING_STAFF = 'pending_staff', // Initial status when student submits
  APPROVED_BY_STAFF = 'approved_by_staff', // Approved by staff
  REJECTED_BY_STAFF = 'rejected_by_staff', // Rejected by staff
  PENDING_HOD = 'pending_hod', // Pending HOD approval
  APPROVED_BY_HOD = 'approved_by_hod', // Approved by HOD
  REJECTED_BY_HOD = 'rejected_by_hod', // Rejected by HOD
  PENDING_ACADEMIC_DIRECTOR = 'pending_academic_director', // Pending Academic Director approval
  APPROVED = 'approved', // Fully approved by Academic Director
  REJECTED_BY_ACADEMIC_DIRECTOR = 'rejected_by_academic_director', // Rejected by Academic Director
  USED = 'used', // Gate pass has been used
  EXPIRED = 'expired' // Gate pass has expired
}

export enum GatePassType {
  LEAVE = 'leave',
  HOME_VISIT = 'home_visit',
  EMERGENCY = 'emergency',
  OTHER = 'other'
}

@Entity('gate_passes')
export class GatePass {
  @PrimaryGeneratedColumn()
  id: number;

  // Student who requested the gate pass
  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  @Index()
  student: User;

  @Column()
  student_id: number;

  // Department of the student
  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  department_id: number;

  // Staff who approved/rejected
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ nullable: true })
  staff_id: number;

  // HOD who approved/rejected
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hod_id' })
  hod: User;

  @Column({ nullable: true })
  hod_id: number;

  // Academic Director who approved/rejected
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'academic_director_id' })
  academicDirector: User;

  @Column({ nullable: true })
  academic_director_id: number;

  // Security who verified the gate pass
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'security_id' })
  security: User;

  @Column({ nullable: true })
  security_id: number;

  @Column({
    type: 'enum',
    enum: GatePassStatus,
    default: GatePassStatus.PENDING_STAFF
  })
  @Index()
  status: GatePassStatus;

  @Column({
    type: 'enum',
    enum: GatePassType,
    default: GatePassType.OTHER
  })
  type: GatePassType;

  @Column({ length: 255 })
  reason: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column('text', { nullable: true })
  staff_comment: string;

  @Column('text', { nullable: true })
  hod_comment: string;

  @Column('text', { nullable: true })
  academic_director_comment: string;

  @Column('text', { nullable: true })
  security_comment: string;

  @Column({ nullable: true })
  checkout_time: Date;

  @Column({ nullable: true })
  checkin_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 