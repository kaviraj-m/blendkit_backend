import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';

export enum GatePassStatus {
  // Student flow
  PENDING_STAFF = 'pending_staff', // Initial status when student submits
  APPROVED_BY_STAFF = 'approved_by_staff', // Approved by staff
  REJECTED_BY_STAFF = 'rejected_by_staff', // Rejected by staff
  PENDING_HOD = 'pending_hod', // Pending HOD approval
  APPROVED_BY_HOD = 'approved_by_hod', // Approved by HOD
  REJECTED_BY_HOD = 'rejected_by_hod', // Rejected by HOD
  PENDING_HOSTEL_WARDEN = 'pending_hostel_warden', // Pending Hostel Warden approval (for hostellers only)
  APPROVED_BY_HOSTEL_WARDEN = 'approved_by_hostel_warden', // Approved by Hostel Warden
  REJECTED_BY_HOSTEL_WARDEN = 'rejected_by_hostel_warden', // Rejected by Hostel Warden
  PENDING_ACADEMIC_DIRECTOR = 'pending_academic_director', // Pending Academic Director approval
  
  // Staff flow
  PENDING_ACADEMIC_DIRECTOR_FROM_STAFF = 'pending_academic_director_from_staff', // When staff applies, goes to academic director
  
  // HOD flow
  PENDING_ACADEMIC_DIRECTOR_FROM_HOD = 'pending_academic_director_from_hod', // When HOD applies, goes to academic director
  
  // Common statuses
  APPROVED = 'approved', // Fully approved by Academic Director
  REJECTED_BY_ACADEMIC_DIRECTOR = 'rejected_by_academic_director', // Rejected by Academic Director
  USED = 'used', // Gate pass has been used
  EXPIRED = 'expired' // Gate pass has expired
}

export enum GatePassType {
  LEAVE = 'leave',
  HOME_VISIT = 'home_visit',
  EMERGENCY = 'emergency',
  OFFICIAL = 'official', // For staff/HOD official duties
  OTHER = 'other'
}

export enum RequesterType {
  STUDENT = 'student',
  STAFF = 'staff',
  HOD = 'hod'
}

@Entity('gate_passes')
export class GatePass {
  @PrimaryGeneratedColumn()
  id: number;

  // The user who requested the gate pass (can be student, staff, or HOD)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  @Index()
  requester: User;

  @Column()
  requester_id: number;
  
  // Type of requester (student, staff, or HOD)
  @Column({
    type: 'enum',
    enum: RequesterType,
    default: RequesterType.STUDENT
  })
  requester_type: RequesterType;

  // For backwards compatibility - Student who requested the gate pass
  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  @Index()
  student: User;

  @Column({ nullable: true })
  student_id: number;

  // Department of the requester
  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  department_id: number;

  // Staff who approved/rejected (for student requests)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ nullable: true })
  staff_id: number;

  // HOD who approved/rejected (for student/staff requests)
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

  // Hostel Warden who approved/rejected (for hostellers only)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hostel_warden_id' })
  hostelWarden: User;

  @Column({ nullable: true })
  hostel_warden_id: number;

  @Column('text', { nullable: true })
  hostel_warden_comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 