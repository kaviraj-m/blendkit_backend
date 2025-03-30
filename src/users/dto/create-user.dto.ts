import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Student identification number', required: false })
  @IsOptional()
  @IsString()
  sin_number?: string;

  @ApiProperty({ description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Father name', required: false })
  @IsOptional()
  @IsString()
  father_name?: string;

  @ApiProperty({ description: 'Current year of study', required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: 'Batch/graduation year', required: false })
  @IsOptional()
  @IsString()
  batch?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Department ID' })
  @IsNotEmpty()
  @IsNumber()
  department_id: number;

  @ApiProperty({ description: 'College ID' })
  @IsNotEmpty()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: 'Day Scholar or Hosteller ID' })
  @IsNotEmpty()
  @IsNumber()
  dayscholar_hosteller_id: number;

  @ApiProperty({ description: 'Quota ID' })
  @IsNotEmpty()
  @IsNumber()
  quota_id: number;

  @ApiProperty({ description: 'Role ID' })
  @IsNotEmpty()
  @IsNumber()
  role_id: number;
} 