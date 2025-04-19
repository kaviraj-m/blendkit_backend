import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryConfig {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: 'daom8i3k5',
      api_key: '219322842522581',
      api_secret: 'yi5YiBQpqep5uFmZ4ITtFFMYpcE',
      secure: true,
    });
  }

  getCloudinary() {
    return cloudinary;
  }
} 