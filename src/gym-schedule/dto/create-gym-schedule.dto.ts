import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymScheduleDto {
  @ApiProperty({ example: 'Monday', description: 'Day of the week', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })
  @IsNotEmpty()
  @IsString()
  day: string;

  @ApiProperty({ example: '06:00', description: 'Opening time in 24-hour format (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  openingTime: string;

  @ApiProperty({ example: '22:00', description: 'Closing time in 24-hour format (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  closingTime: string;

  @ApiProperty({ example: true, description: 'Whether this schedule is currently active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'Special extended hours for holiday season', description: 'Any special notes about this schedule', required: false })
  @IsOptional()
  @IsString()
  specialNote?: string;
}