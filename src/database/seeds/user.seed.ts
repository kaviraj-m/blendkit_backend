import { DataSource } from 'typeorm';
import { User, Role, Quota, Department, College, DayScholarHosteller } from '../../entities';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const quotaRepository = dataSource.getRepository(Quota);
  const departmentRepository = dataSource.getRepository(Department);
  const collegeRepository = dataSource.getRepository(College);
  const dayScholarHostellerRepository = dataSource.getRepository(DayScholarHosteller);
  
  // Check if users already exist
  const usersCount = await userRepository.count();
  if (usersCount > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }
  
  // Get roles, quotas, departments, colleges, and day scholar/hosteller options
  const roles = await roleRepository.find();
  const quotas = await quotaRepository.find();
  const departments = await departmentRepository.find();
  const colleges = await collegeRepository.find();
  const dayScholarHostellerOptions = await dayScholarHostellerRepository.find();
  
  if (roles.length === 0 || quotas.length === 0 || departments.length === 0 || 
      colleges.length === 0 || dayScholarHostellerOptions.length === 0) {
    console.log('Required data not found. Please seed roles, quotas, departments, colleges, and day scholar/hosteller options first.');
    console.log(`Found ${roles.length} roles, ${quotas.length} quotas, ${departments.length} departments, ${colleges.length} colleges, ${dayScholarHostellerOptions.length} day scholar/hosteller options.`);
    return;
  }
  
  // Log all found entities to help with debugging
  console.log('Found Roles:', roles.map(r => `${r.id}: ${r.name}`));
  console.log('Found Quotas:', quotas.map(q => `${q.id}: ${q.name}`));
  console.log('Found Departments:', departments.map(d => `${d.id}: ${d.name}`));
  console.log('Found Colleges:', colleges.map(c => `${c.id}: ${c.name}`));
  console.log('Found Day Scholar/Hosteller Options:', dayScholarHostellerOptions.map(d => `${d.id}: ${d.type}`));
  
  // Find specific roles
  const studentRole = roles.find(role => role.name === 'student');
  const staffRole = roles.find(role => role.name === 'staff');
  const gymStaffRole = roles.find(role => role.name === 'gym_staff');
  const adminRole = roles.find(role => role.name === 'admin');
  
  // Find management quota
  const managementQuota = quotas.find(quota => quota.name === 'Management');
  
  // Find IT department
  const itDepartment = departments.find(department => department.name === 'Information Technology');
  
  // Find engineering college
  const engineeringCollege = colleges.find(college => college.name === 'Sri Shanmugha College of Engineering');
  
  // Find day scholar option
  const dayScholar = dayScholarHostellerOptions.find(option => option.type === 'Day Scholar');
  const hosteller = dayScholarHostellerOptions.find(option => option.type === 'Hosteller');
  
  // Check if required entities were found
  if (!studentRole || !staffRole || !gymStaffRole || !adminRole || 
      !managementQuota || !itDepartment || !engineeringCollege || 
      !dayScholar || !hosteller) {
    console.log('Some required entities were not found:');
    console.log(`studentRole: ${studentRole?.id}, staffRole: ${staffRole?.id}, gymStaffRole: ${gymStaffRole?.id}, adminRole: ${adminRole?.id}`);
    console.log(`managementQuota: ${managementQuota?.id}, itDepartment: ${itDepartment?.id}, engineeringCollege: ${engineeringCollege?.id}`);
    console.log(`dayScholar: ${dayScholar?.id}, hosteller: ${hosteller?.id}`);
    return;
  }
  
  // Common password for all users
  const commonPassword = await bcrypt.hash('123456789', 10);
  
  // Create users array
  const users = [
    // Student user (Kaviraj)
    {
      name: 'Kaviraj',
      email: 'kaviraj@example.com',
      password: commonPassword,
      sin_number: 'E21IT030',
      father_name: 'Mani',
      year: 4,
      batch: '2021-2025',
      phone: '9876543201',
      role_id: studentRole.id,
      quota_id: managementQuota.id,
      department_id: itDepartment.id,
      college_id: engineeringCollege.id,
      dayscholar_hosteller_id: dayScholar.id
    },
    // Staff user
    {
      name: 'John Staff',
      email: 'staff@example.com',
      password: commonPassword,
      sin_number: 'STAFF001',
      father_name: 'Staff Father',
      year: 0,
      batch: 'STAFF',
      phone: '9876543202',
      role_id: staffRole.id,
      quota_id: managementQuota.id,
      department_id: itDepartment.id,
      college_id: engineeringCollege.id,
      dayscholar_hosteller_id: dayScholar.id
    },
    // Gym Staff user
    {
      name: 'Gym Staff',
      email: 'gymstaff@example.com',
      password: commonPassword,
      sin_number: 'GYM001',
      father_name: 'Gym Staff Father',
      year: 0,
      batch: 'STAFF',
      phone: '9876543203',
      role_id: gymStaffRole.id,
      quota_id: managementQuota.id,
      department_id: itDepartment.id,
      college_id: engineeringCollege.id,
      dayscholar_hosteller_id: dayScholar.id
    },
    // Admin user
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: commonPassword,
      sin_number: 'ADMIN001',
      father_name: 'Admin Father',
      year: 0,
      batch: 'ADMIN',
      phone: '9876543200',
      role_id: adminRole.id,
      quota_id: managementQuota.id,
      department_id: itDepartment.id,
      college_id: engineeringCollege.id,
      dayscholar_hosteller_id: dayScholar.id
    },
    // Another student (hosteller)
    {
      name: 'Jane Student',
      email: 'student@example.com',
      password: commonPassword,
      sin_number: 'E21IT031',
      father_name: 'Student Father',
      year: 3,
      batch: '2022-2026',
      phone: '9876543204',
      role_id: studentRole.id,
      quota_id: managementQuota.id,
      department_id: itDepartment.id,
      college_id: engineeringCollege.id,
      dayscholar_hosteller_id: hosteller.id
    }
  ];
  
  // Save users to database
  for (const userData of users) {
    try {
      console.log(`Creating user ${userData.name} with role_id=${userData.role_id}, quota_id=${userData.quota_id}, department_id=${userData.department_id}, college_id=${userData.college_id}, dayscholar_hosteller_id=${userData.dayscholar_hosteller_id}`);
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`User ${userData.name} created with email ${userData.email}`);
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error);
    }
  }
  
  console.log('Users seeding completed');
}; 