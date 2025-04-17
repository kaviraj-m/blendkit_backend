import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSocialPostDto } from './create-social-post.dto';

export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {
  @ApiProperty({ 
    example: true, 
    description: 'Whether the post is active',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 