import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'ID of the user checking in to the gym' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: true, description: 'Whether the user is present at the gym', required: false })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiProperty({ example: 'First time visitor, provided orientation', description: 'Additional notes about the attendance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}