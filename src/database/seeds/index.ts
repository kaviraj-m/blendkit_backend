import { DataSource } from 'typeorm';
import { seedRoles } from './role.seed';
import { seedColleges } from './college.seed';
import { seedDepartments } from './department.seed';
import { seedQuotas } from './quota.seed';
import { seedDayScholarHostellers } from './day-scholar-hosteller.seed';
import { seedUsers } from './user.seed';
import { seedGymSchedules } from './gym-schedule.seed';
import { seedEquipment } from './equipment.seed';
import { seedGymPosts } from './gym-posts.seed';
import { seedAttendance } from './attendance.seed';

export const runSeeders = async (dataSource: DataSource): Promise<void> => {
  await dataSource.initialize();
  
  try {
    console.log('Running seeders...');
    
    // Run seeders in order
    // 1. Basic data first
    await seedRoles(dataSource);
    await seedQuotas(dataSource);
    await seedDayScholarHostellers(dataSource);
    
    // 2. Colleges and departments
    await seedColleges(dataSource);
    await seedDepartments(dataSource);
    
    // 3. Users last (depends on all other data)
    await seedUsers(dataSource);
    
    // 4. Gym-related data (depends on users)
    await seedGymSchedules(dataSource);
    await seedEquipment(dataSource);
    await seedGymPosts(dataSource);
    await seedAttendance(dataSource);
    
    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}; 