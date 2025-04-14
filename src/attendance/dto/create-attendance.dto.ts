import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'ID of the user checking in to the gym' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: '2023-07-15T18:30:00Z', description: 'Time when the user checked in to the gym', required: false })
  @IsOptional()
  @IsDate()
  checkInTime?: Date;

  @ApiProperty({ example: true, description: 'Whether the user is present at the gym', required: false })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiProperty({ example: 'First time visitor, provided orientation', description: 'Additional notes about the attendance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}