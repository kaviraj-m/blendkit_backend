import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Quota } from '../../entities/quota.entity';
import { DayScholarHosteller } from '../../entities/day-scholar-hosteller.entity';
import { College } from '../../entities/college.entity';
import { Department } from '../../entities/department.entity';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get repositories
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const quotaRepository = app.get<Repository<Quota>>(getRepositoryToken(Quota));
    const dayScholarHostellerRepository = app.get<Repository<DayScholarHosteller>>(
      getRepositoryToken(DayScholarHosteller),
    );
    const collegeRepository = app.get<Repository<College>>(getRepositoryToken(College));
    const departmentRepository = app.get<Repository<Department>>(getRepositoryToken(Department));
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Clear existing data (optional)
    await userRepository.delete({});
    await departmentRepository.delete({});
    await collegeRepository.delete({});
    await dayScholarHostellerRepository.delete({});
    await quotaRepository.delete({});
    await roleRepository.delete({});

    console.log('Existing data cleared. Seeding new data...');

    // Seed roles - Start from ID 1
    const roles = await roleRepository.save([
      { id: 1, name: 'student', description: 'Student role' },
      { id: 2, name: 'staff', description: 'Staff role' },
      { id: 3, name: 'academic_director', description: 'Academic Director role' },
      { id: 4, name: 'executive_director', description: 'Executive Director role' },
      { id: 5, name: 'security', description: 'Security staff role' },
      { id: 6, name: 'gym_staff', description: 'Gym staff role' },
      { id: 7, name: 'admin', description: 'Administrator with full access' },
    ]);
    console.log(`${roles.length} roles created`);

    // Seed quotas - Start from ID 1
    const quotas = await quotaRepository.save([
      { id: 1, name: 'Management', description: 'Management quota' },
      { id: 2, name: 'Government', description: 'Government quota' },
    ]);
    console.log(`${quotas.length} quotas created`);

    // Seed day scholar/hosteller options - Start from ID 1
    const dayScholarHostellerOptions = await dayScholarHostellerRepository.save([
      { id: 1, type: 'Day Scholar', description: 'Student who commutes daily' },
      { id: 2, type: 'Hosteller', description: 'Student who stays in hostel' },
    ]);
    console.log(`${dayScholarHostellerOptions.length} day scholar/hosteller options created`);

    // Seed colleges - Start from ID 1
    const colleges = await collegeRepository.save([
      { 
        id: 1,
        name: 'Sri Shanmugha College of Engineering', 
        code: 'SSCE1',
        address: 'Salem, Tamil Nadu', 
        phone: '9876543210', 
        email: 'info@ssce.edu.in', 
        website: 'https://ssce.edu.in',
        description: 'Premier engineering institution in Salem'
      },
      { 
        id: 2,
        name: 'Sri Shanmugha College of Nursing', 
        code: 'SSCN2',
        address: 'Salem, Tamil Nadu', 
        phone: '9876543211', 
        email: 'nursing@ssce.edu.in', 
        website: 'https://ssce.edu.in/nursing',
        description: 'Leading nursing college in Salem'
      },
    ]);
    console.log(`${colleges.length} colleges created`);

    // Seed departments - Start from ID 1
    const departments = await departmentRepository.save([
      { 
        id: 1,
        name: 'Information Technology', 
        code: 'IT', 
        description: 'Information Technology Department',
        college_id: colleges[0].id
      },
      { 
        id: 2,
        name: 'Computer Science Engineering', 
        code: 'CSE', 
        description: 'Computer Science and Engineering Department',
        college_id: colleges[0].id
      },
      { 
        id: 3,
        name: 'Electrical Engineering', 
        code: 'EEE', 
        description: 'Electrical and Electronics Engineering',
        college_id: colleges[0].id
      },
      { 
        id: 4,
        name: 'General Nursing', 
        code: 'GN', 
        description: 'Department of General Nursing',
        college_id: colleges[1].id
      },
      { 
        id: 5,
        name: 'Midwifery', 
        code: 'MID', 
        description: 'Department of Midwifery',
        college_id: colleges[1].id
      },
    ]);
    console.log(`${departments.length} departments created`);

    // Create users
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await userRepository.save({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      sin_number: 'ADMIN001',
      father_name: 'Admin Father',
      year: 0,
      batch: 'ADMIN',
      phone: '9876543200',
      role_id: roles[6].id, // admin role
      quota_id: quotas[0].id, // management quota
      department_id: departments[0].id, // IT department
      college_id: colleges[0].id, // Sri Shanmugha College of Engineering
      dayscholar_hosteller_id: dayScholarHostellerOptions[0].id, // Day Scholar
    });
    console.log('Admin user created');

    // Kaviraj user
    const userPassword = await bcrypt.hash('123456789', 10);
    const kavirajUser = await userRepository.save({
      name: 'Kaviraj',
      email: 'kaviraj@example.com',
      password: userPassword,
      sin_number: 'E21IT030',
      father_name: 'Kaviraj Father',
      year: 4,
      batch: '2021-2025',
      phone: '9876543201',
      role_id: roles[0].id, // student role (id: 1)
      quota_id: quotas[0].id, // management quota (id: 1)
      department_id: departments[0].id, // IT department (id: 1)
      college_id: colleges[0].id, // Sri Shanmugha College of Engineering
      dayscholar_hosteller_id: dayScholarHostellerOptions[0].id, // Day Scholar (id: 1)
    });
    console.log('Kaviraj user created');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 