import { DataSource } from 'typeorm';
import { College } from '../../entities';

export const seedColleges = async (dataSource: DataSource): Promise<void> => {
  const collegeRepository = dataSource.getRepository(College);
  
  // Check if colleges already exist
  const collegesCount = await collegeRepository.count();
  if (collegesCount > 0) {
    console.log('Colleges already seeded, skipping...');
    return;
  }
  
  // Create colleges
  const colleges = [
    { 
      name: 'Sri Shanmugha College of Engineering', 
      code: 'SSCE1',
      address: 'Salem, Tamil Nadu', 
      city: 'Salem',
      state: 'Tamil Nadu',
      phone: '9876543210', 
      email: 'info@ssce.edu.in', 
      website: 'https://ssce.edu.in',
      description: 'Premier engineering institution in Salem'
    },
    { 
      name: 'Sri Shanmugha College of Nursing', 
      code: 'SSCN2',
      address: 'Salem, Tamil Nadu', 
      city: 'Salem',
      state: 'Tamil Nadu',
      phone: '9876543211', 
      email: 'nursing@ssce.edu.in', 
      website: 'https://ssce.edu.in/nursing',
      description: 'Leading nursing college in Salem'
    },
  ];
  
  // Save colleges to database
  for (const collegeData of colleges) {
    const college = collegeRepository.create(collegeData);
    await collegeRepository.save(college);
    console.log(`College ${collegeData.name} created`);
  }
  
  console.log('Colleges seeding completed');
}; 