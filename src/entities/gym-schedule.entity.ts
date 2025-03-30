import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gym_schedules')
export class GymSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  day: string; // Monday, Tuesday, etc.

  @Column({ type: 'time' })
  openingTime: string;

  @Column({ type: 'time' })
  closingTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  specialNote: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 