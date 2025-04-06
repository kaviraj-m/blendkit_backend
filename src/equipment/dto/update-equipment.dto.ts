import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEquipmentDto {
  @ApiProperty({ example: 'Updated Dumbbell Set', description: 'Updated name of the equipment', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated set of adjustable dumbbells with new weight range', description: 'Updated description of the equipment', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15, description: 'Updated quantity of equipment available', minimum: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 'https://example.com/images/updated-dumbbell-set.jpg', description: 'Updated URL to the equipment image', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'Free Weights', description: 'Updated category of the equipment', enum: ['Free Weights', 'Cardio', 'Machines', 'Accessories'], required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Resistance', description: 'Updated type of training this equipment is used for', enum: ['Resistance', 'Cardio', 'Flexibility', 'Balance'], required: false })
  @IsOptional()
  @IsString()
  trainingType?: string;

  @ApiProperty({ example: true, description: 'Whether the equipment is currently available for use', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'Weight Room - Section B', description: 'Updated location of the equipment in the gym', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}