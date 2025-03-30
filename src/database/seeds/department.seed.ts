import { DataSource } from 'typeorm';
import { Department, College } from '../../entities';

export const seedDepartments = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);
  const collegeRepository = dataSource.getRepository(College);
  
  // Check if departments already exist
  const departmentsCount = await departmentRepository.count();
  if (departmentsCount > 0) {
    console.log('Departments already seeded, skipping...');
    return;
  }
  
  // Get colleges
  const engineeringCollege = await collegeRepository.findOne({ where: { name: 'Sri Shanmugha College of Engineering' } });
  const nursingCollege = await collegeRepository.findOne({ where: { name: 'Sri Shanmugha College of Nursing' } });
  
  if (!engineeringCollege || !nursingCollege) {
    console.log('Colleges not found. Please seed colleges first.');
    return;
  }

  // Create departments
  const departments = [
    { 
      name: 'Information Technology', 
      code: 'IT', 
      description: 'Information Technology Department',
      college_id: engineeringCollege.id
    },
    { 
      name: 'Computer Science Engineering', 
      code: 'CSE', 
      description: 'Computer Science and Engineering Department',
      college_id: engineeringCollege.id
    },
    { 
      name: 'Electrical Engineering', 
      code: 'EEE', 
      description: 'Electrical and Electronics Engineering',
      college_id: engineeringCollege.id
    },
    { 
      name: 'General Nursing', 
      code: 'GN', 
      description: 'Department of General Nursing',
      college_id: nursingCollege.id
    },
    { 
      name: 'Midwifery', 
      code: 'MID', 
      description: 'Department of Midwifery',
      college_id: nursingCollege.id
    },
  ];
  
  // Save departments to database
  for (const departmentData of departments) {
    const department = departmentRepository.create(departmentData);
    await departmentRepository.save(department);
    console.log(`Department ${departmentData.name} created`);
  }
  
  console.log('Departments seeding completed');
}; 