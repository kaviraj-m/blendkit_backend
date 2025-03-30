import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      url: `redis://${this.configService.get('REDIS_USERNAME')}:${this.configService.get('REDIS_PASSWORD')}@${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}/${this.configService.get('REDIS_DATABASE')}`,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleInit() {
    await this.client.connect();
    console.log('Redis client connected');
  }

  async onModuleDestroy() {
    await this.client.disconnect();
    console.log('Redis client disconnected');
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (ttl) {
      await this.client.setEx(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
} 