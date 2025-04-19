import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CloudinaryConfig } from './cloudinary.config';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { UploadResponseDto } from './dto/upload-response.dto';

// Import the types explicitly
import * as multer from 'multer';
import { Request } from 'express';

// Define the missing type if @types/multer doesn't provide it
interface MulterFile extends Express.Multer.File {}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private cloudinaryConfig: CloudinaryConfig) {}

  async uploadFile(
    file: MulterFile,
    folder: string = 'uploads'
  ): Promise<UploadResponseDto> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const cloudinary = this.cloudinaryConfig.getCloudinary();
      
      return new Promise<UploadResponseDto>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error || !result) {
              this.logger.error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
              reject(error || new Error('Upload failed'));
            } else {
              this.logger.log(`Uploaded file: ${result.public_id}`);
              
              // Transform the Cloudinary response to match our DTO
              const responseDto = {
                ...result,
                // Ensure required fields are present
                folder: folder,
                asset_id: result.asset_id || `asset_${result.public_id}`,
              } as UploadResponseDto;
              
              resolve(responseDto);
            }
          }
        );

        // Convert buffer to stream and pipe to cloudinary
        const bufferStream = require('stream').Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`Error in uploadFile: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      if (!publicId) {
        throw new BadRequestException('No public ID provided');
      }

      const cloudinary = this.cloudinaryConfig.getCloudinary();
      
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Error in deleteFile: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: MulterFile[],
    folder: string = 'uploads'
  ): Promise<UploadResponseDto[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error(`Error in uploadMultipleFiles: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload files: ${error.message}`);
    }
  }
} 