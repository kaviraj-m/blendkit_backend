import { DataSource } from 'typeorm';
import { Role } from '../../entities';

export const seedRoles = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  
  // Check if roles already exist
  const rolesCount = await roleRepository.count();
  if (rolesCount > 0) {
    console.log('Roles already seeded, skipping...');
    return;
  }
  
  // Create roles
  const roles = [
    {
      name: 'student',
      description: 'Student role with access to view gym schedule, posts, and equipment',
    },
    {
      name: 'staff',
      description: 'Staff role with access to view and manage student data',
    },
    {
      name: 'academic_director',
      description: 'Academic director role with administrative access to academic data',
    },
    {
      name: 'executive_director',
      description: 'Executive director role with high-level administrative access',
    },
    {
      name: 'security',
      description: 'Security role with access to attendance and campus security features',
    },
    {
      name: 'gym_staff',
      description: 'Gym staff role with access to manage schedules, attendance, posts, and equipment',
    },
    {
      name: 'admin',
      description: 'Administrator role with full system access',
    },
  ];
  
  // Save roles to database
  for (const roleData of roles) {
    const role = roleRepository.create(roleData);
    await roleRepository.save(role);
    console.log(`Role ${roleData.name} created`);
  }
  
  console.log('Roles seeding completed');
}; 