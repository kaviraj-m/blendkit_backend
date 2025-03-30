import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateCollegeDto {
  @ApiProperty({ example: 'Engineering College', description: 'College name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ENGC', description: 'College code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '123 College Road, Chennai', description: 'College address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '9876543210', description: 'College phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'engineering@example.com', description: 'College email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://engineering.example.com', description: 'College website' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'Premier engineering institution', description: 'College description' })
  @IsString()
  @IsOptional()
  description?: string;
} 