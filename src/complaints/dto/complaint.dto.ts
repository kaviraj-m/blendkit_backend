import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ComplaintStatus } from '../../entities/complaint.entity';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateComplaintStatusDto {
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @IsString()
  @IsOptional()
  response: string;
} 