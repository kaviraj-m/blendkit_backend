import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkoutType } from '../attendance/dto/create-attendance.dto';
import { WorkoutCompletionStatus } from '../attendance/dto/update-attendance.dto';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ name: 'is_present', default: true })
  isPresent: boolean;

  @Column({ name: 'check_in', type: 'timestamp' })
  checkInTime: Date;

  @Column({ name: 'check_out', type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({ nullable: true })
  notes: string;
  
  @Column({ 
    name: 'workout_type',
    type: 'enum', 
    enum: WorkoutType, 
    nullable: true 
  })
  workoutType: WorkoutType;
  
  @Column({ 
    name: 'planned_duration',
    type: 'int', 
    nullable: true 
  })
  plannedDuration: number;
  
  @Column({ 
    name: 'actual_duration',
    type: 'int', 
    nullable: true 
  })
  actualDuration: number;
  
  @Column({ 
    name: 'is_first_visit',
    type: 'boolean', 
    default: false 
  })
  isFirstVisit: boolean;
  
  @Column({ 
    name: 'completion_status',
    type: 'enum', 
    enum: WorkoutCompletionStatus, 
    nullable: true 
  })
  completionStatus: WorkoutCompletionStatus;
  
  @Column({ 
    name: 'staff_observations',
    type: 'text', 
    nullable: true 
  })
  staffObservations: string;
  
  @Column({ 
    name: 'workout_intensity',
    type: 'int', 
    nullable: true 
  })
  workoutIntensity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 