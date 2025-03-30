import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

const configService = new ConfigService();

// Helper function to get required env variables
const getEnv = (key: string): string => {
  const value = configService.get<string>(key);
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

// Define data source for TypeORM
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT'), 10),
  username: getEnv('DB_USERNAME'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_NAME'),
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '**', '*{.ts,.js}')],
  synchronize: false,
}); 