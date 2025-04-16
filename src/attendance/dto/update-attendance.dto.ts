import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutType } from './create-attendance.dto';

export enum WorkoutCompletionStatus {
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  NOT_COMPLETED = 'not_completed',
  CANCELLED = 'cancelled'
}

export class UpdateAttendanceDto {
  @ApiProperty({ example: '2023-07-15T18:30:00Z', description: 'Time when the user checked out from the gym', required: false })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiProperty({ example: true, description: 'Updated status of whether the user is present at the gym', required: false })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiProperty({ example: 'Completed full workout session', description: 'Updated notes about the attendance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
  
  @ApiProperty({ 
    example: WorkoutType.CARDIO, 
    enum: WorkoutType,
    description: 'Type of workout the user completed',
    required: false 
  })
  @IsOptional()
  @IsEnum(WorkoutType)
  workoutType?: WorkoutType;
  
  @ApiProperty({ 
    example: 65, 
    description: 'Actual workout duration in minutes',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  actualDuration?: number;
  
  @ApiProperty({ 
    example: WorkoutCompletionStatus.COMPLETED, 
    enum: WorkoutCompletionStatus,
    description: 'Status of workout completion',
    required: false 
  })
  @IsOptional()
  @IsEnum(WorkoutCompletionStatus)
  completionStatus?: WorkoutCompletionStatus;
  
  @ApiProperty({ 
    example: 'Person seemed tired after 30 minutes', 
    description: 'Gym staff observations about the workout',
    required: false 
  })
  @IsOptional()
  @IsString()
  staffObservations?: string;
  
  @ApiProperty({ 
    example: 4, 
    description: 'Self-reported workout intensity (1-5 scale)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  workoutIntensity?: number;
}