import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({ 
    example: true, 
    description: 'Whether the comment is active',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 