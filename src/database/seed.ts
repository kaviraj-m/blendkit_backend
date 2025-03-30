import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { 
  Role, 
  User, 
  Equipment, 
  Attendance, 
  GymPost, 
  GymSchedule, 
  College, 
  Department, 
  DayScholarHosteller, 
  Quota 
} from '../entities';
import { runSeeders } from './seeds';

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
const dataSource = new DataSource({
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT'), 10),
  username: getEnv('DB_USERNAME'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_NAME'),
  entities: [Role, User, Equipment, Attendance, GymPost, GymSchedule, College, Department, DayScholarHosteller, Quota],
  synchronize: false,
});

// Run seeders
runSeeders(dataSource)
  .then(() => {
    console.log('Database seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  }); 