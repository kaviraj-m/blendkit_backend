import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiProperty({ example: '2023-07-15T18:30:00Z', description: 'Time when the user checked out from the gym', required: false })
  @IsOptional()
  @IsDate()
  checkOutTime?: Date;

  @ApiProperty({ example: true, description: 'Updated status of whether the user is present at the gym', required: false })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiProperty({ example: 'Completed full workout session', description: 'Updated notes about the attendance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}