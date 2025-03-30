import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateQuotaDto {
  @ApiProperty({ example: 'Management', description: 'Quota name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Management quota for students', description: 'Quota description' })
  @IsString()
  @IsOptional()
  description?: string;
} 