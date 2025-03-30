import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science Engineering', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CSE', description: 'Department code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Computer Science and Engineering Department', description: 'Department description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'College ID' })
  @IsInt()
  @IsNotEmpty()
  college_id: number;
} 