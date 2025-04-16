import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkoutType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  MIXED = 'mixed',
  OTHER = 'other'
}

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'ID of the user checking in to the gym' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: '2023-07-15T18:30:00Z', description: 'Time when the user checked in to the gym', required: false })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiProperty({ example: true, description: 'Whether the user is present at the gym', required: false })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiProperty({ example: 'First time visitor, provided orientation', description: 'Additional notes about the attendance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
  
  @ApiProperty({ 
    example: WorkoutType.CARDIO, 
    enum: WorkoutType,
    description: 'Type of workout the user plans to do',
    required: false 
  })
  @IsOptional()
  @IsEnum(WorkoutType)
  workoutType?: WorkoutType;
  
  @ApiProperty({ 
    example: 60, 
    description: 'Planned workout duration in minutes',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  plannedDuration?: number;
  
  @ApiProperty({ 
    example: true, 
    description: 'Whether this is the first time user is visiting the gym',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isFirstVisit?: boolean;
}