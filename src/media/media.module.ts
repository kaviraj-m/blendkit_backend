import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryConfig } from './cloudinary.config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      // We're using memory storage since we're streaming directly to Cloudinary
      storage: memoryStorage(),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryConfig],
  exports: [MediaService],
})
export class MediaModule {}

// Helper function to get memory storage
function memoryStorage() {
  const multer = require('multer');
  return multer.memoryStorage();
} 