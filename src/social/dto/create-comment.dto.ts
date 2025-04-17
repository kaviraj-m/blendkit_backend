import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ 
    example: 'Great post! I think this will be very helpful.', 
    description: 'Content of the comment' 
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID of the parent comment (for threaded replies)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
} 