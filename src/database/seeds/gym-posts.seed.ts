import { DataSource } from 'typeorm';
import { GymPost } from '../../entities/gym-post.entity';
import { User } from '../../entities/user.entity';

export const seedGymPosts = async (dataSource: DataSource): Promise<void> => {
  const gymPostRepository = dataSource.getRepository(GymPost);
  const userRepository = dataSource.getRepository(User);
  
  // Check if gym posts already exist
  const postsCount = await gymPostRepository.count();
  if (postsCount > 0) {
    console.log('Gym posts already seeded, skipping...');
    return;
  }
  
  // Find gym staff user to set as creator
  const gymStaffUser = await userRepository.findOne({ 
    where: { email: 'gymstaff@example.com' } 
  });
  
  if (!gymStaffUser) {
    console.log('Gym staff user not found, skipping gym posts seed');
    return;
  }
  
  // Create gym posts
  const posts = [
    {
      title: 'Welcome to Our Gym!',
      content: 'We are excited to welcome all students and staff to our state-of-the-art gym facility. Our mission is to provide a safe and motivating environment for everyone to pursue their fitness goals.',
      bodyType: 'general',
      exerciseType: 'general',
      isActive: true,
      createdBy: gymStaffUser
    },
    {
      title: 'Muscle Building Program for Beginners',
      content: 'New to strength training? Start with our beginner-friendly muscle building program designed to help you build a strong foundation. This program focuses on compound movements like squats, deadlifts, and bench press with progressive overload.',
      bodyType: 'muscular',
      exerciseType: 'strength',
      isActive: true,
      createdBy: gymStaffUser
    },
    {
      title: 'Weight Loss Challenge: 8-Week Program',
      content: 'Join our 8-week weight loss challenge! This program combines high-intensity interval training (HIIT), steady-state cardio, and nutritional guidance to help you achieve your weight loss goals safely and effectively.',
      bodyType: 'weight-loss',
      exerciseType: 'cardio',
      isActive: true,
      createdBy: gymStaffUser
    },
    {
      title: 'Yoga for Flexibility and Stress Relief',
      content: 'Discover the benefits of yoga for improving flexibility, reducing stress, and enhancing overall well-being. Our yoga sessions are suitable for all fitness levels and focus on mindful movement and breathwork.',
      bodyType: 'flexible',
      exerciseType: 'flexibility',
      isActive: true,
      createdBy: gymStaffUser
    },
    {
      title: 'Functional Fitness: Train for Real Life',
      content: 'Functional fitness training improves your ability to perform everyday activities with ease. Our functional fitness program incorporates movements that simulate real-life actions, enhancing your overall quality of life.',
      bodyType: 'athletic',
      exerciseType: 'functional',
      isActive: true,
      createdBy: gymStaffUser
    }
  ];
  
  // Save posts to database
  for (const postData of posts) {
    const post = gymPostRepository.create(postData);
    await gymPostRepository.save(post);
    console.log(`Gym post "${postData.title}" created`);
  }
  
  console.log('Gym posts seeding completed');
}; 