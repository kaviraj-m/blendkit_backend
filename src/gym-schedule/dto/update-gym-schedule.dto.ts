import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGymScheduleDto {
  @ApiProperty({ example: 'Friday', description: 'Updated day of the week', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: false })
  @IsOptional()
  @IsString()
  day?: string;

  @ApiProperty({ example: '07:00', description: 'Updated opening time in 24-hour format (HH:MM)', required: false })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiProperty({ example: '23:00', description: 'Updated closing time in 24-hour format (HH:MM)', required: false })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiProperty({ example: false, description: 'Updated status of whether this schedule is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'Reduced hours due to maintenance', description: 'Updated special notes about this schedule', required: false })
  @IsOptional()
  @IsString()
  specialNote?: string;
}