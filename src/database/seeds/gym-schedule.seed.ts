import { DataSource } from 'typeorm';
import { GymSchedule } from '../../entities/gym-schedule.entity';

export const seedGymSchedules = async (dataSource: DataSource): Promise<void> => {
  const gymScheduleRepository = dataSource.getRepository(GymSchedule);
  
  // Check if gym schedules already exist
  const schedulesCount = await gymScheduleRepository.count();
  if (schedulesCount > 0) {
    console.log('Gym schedules already seeded, skipping...');
    return;
  }
  
  // Create gym schedules for each day of the week
  const schedules = [
    {
      day: 'Monday',
      openingTime: '06:00:00',
      closingTime: '21:00:00',
      isActive: true,
      specialNote: 'Regular schedule',
    },
    {
      day: 'Tuesday',
      openingTime: '06:00:00',
      closingTime: '21:00:00',
      isActive: true,
      specialNote: 'Regular schedule',
    },
    {
      day: 'Wednesday',
      openingTime: '06:00:00',
      closingTime: '21:00:00',
      isActive: true,
      specialNote: 'Regular schedule',
    },
    {
      day: 'Thursday',
      openingTime: '06:00:00',
      closingTime: '21:00:00',
      isActive: true,
      specialNote: 'Regular schedule',
    },
    {
      day: 'Friday',
      openingTime: '06:00:00',
      closingTime: '21:00:00',
      isActive: true,
      specialNote: 'Regular schedule',
    },
    {
      day: 'Saturday',
      openingTime: '08:00:00',
      closingTime: '18:00:00',
      isActive: true,
      specialNote: 'Weekend hours',
    },
    {
      day: 'Sunday',
      openingTime: '08:00:00',
      closingTime: '16:00:00',
      isActive: true,
      specialNote: 'Weekend hours',
    },
  ];
  
  // Save schedules to database
  for (const scheduleData of schedules) {
    const schedule = gymScheduleRepository.create(scheduleData);
    await gymScheduleRepository.save(schedule);
    console.log(`Gym schedule for ${scheduleData.day} created`);
  }
  
  console.log('Gym schedules seeding completed');
}; 