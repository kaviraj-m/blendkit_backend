import { DataSource } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { User } from '../../entities/user.entity';

export const seedAttendance = async (dataSource: DataSource): Promise<void> => {
  const attendanceRepository = dataSource.getRepository(Attendance);
  const userRepository = dataSource.getRepository(User);
  
  // Check if attendance records already exist
  const attendanceCount = await attendanceRepository.count();
  if (attendanceCount > 0) {
    console.log('Attendance records already seeded, skipping...');
    return;
  }
  
  // Find some users for the attendance records
  const users = await userRepository.find({
    take: 5,
    order: { id: 'ASC' }
  });
  
  if (users.length === 0) {
    console.log('No users found, skipping attendance seed');
    return;
  }
  
  // Create date range for the past week
  const today = new Date();
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  
  // Create attendance records for each user for the past week
  let recordsCreated = 0;
  
  for (const user of users) {
    // Only create records for students
    if (user.role_id !== 1) continue;
    
    for (const date of dates) {
      // Skip weekends for some users to make it realistic
      if ((date.getDay() === 0 || date.getDay() === 6) && Math.random() > 0.3) {
        continue;
      }
      
      // Random attendance with 80% present probability
      const isPresent = Math.random() < 0.8;
      
      // Set check-in time between 6 AM and 9 AM
      const checkInHour = 6 + Math.floor(Math.random() * 3);
      const checkInMinute = Math.floor(Math.random() * 60);
      
      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
      
      // Set check-out time between 4 PM and 8 PM for present users
      let checkOutTime: Date | undefined = undefined;
      if (isPresent) {
        const checkOutHour = 16 + Math.floor(Math.random() * 4);
        const checkOutMinute = Math.floor(Math.random() * 60);
        
        checkOutTime = new Date(date);
        checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
      }
      
      // Create and save attendance record directly
      const attendance = new Attendance();
      attendance.user = user;
      attendance.checkInTime = checkInTime;
      if (checkOutTime) {
        attendance.checkOutTime = checkOutTime;
      }
      attendance.isPresent = isPresent;
      attendance.notes = isPresent ? 'Regular attendance' : 'Absent';
      
      await attendanceRepository.save(attendance);
      recordsCreated++;
    }
  }
  
  console.log(`${recordsCreated} attendance records created`);
  console.log('Attendance seeding completed');
}; 