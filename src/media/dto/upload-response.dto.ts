import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'Public ID of the uploaded file' })
  public_id: string;

  @ApiProperty({ description: 'Version of the uploaded file' })
  version: number | string;

  @ApiProperty({ description: 'URL of the uploaded file' })
  url: string;

  @ApiProperty({ description: 'Secure URL of the uploaded file' })
  secure_url: string;

  @ApiProperty({ description: 'Asset ID' })
  asset_id: string;

  @ApiProperty({ description: 'Format of the file' })
  format?: string;

  @ApiProperty({ description: 'Resource type of the file' })
  resource_type?: string;

  @ApiProperty({ description: 'Width of the image (if applicable)' })
  width?: number;

  @ApiProperty({ description: 'Height of the image (if applicable)' })
  height?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: string;

  @ApiProperty({ description: 'Folder path where the file is stored' })
  folder: string;
  
  // Add any additional fields that might be in the Cloudinary response
  [key: string]: any;
} 