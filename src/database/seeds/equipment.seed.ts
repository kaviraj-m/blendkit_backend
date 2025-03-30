import { DataSource } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';

export const seedEquipment = async (dataSource: DataSource): Promise<void> => {
  const equipmentRepository = dataSource.getRepository(Equipment);
  
  // Check if equipment already exists
  const equipmentCount = await equipmentRepository.count();
  if (equipmentCount > 0) {
    console.log('Equipment already seeded, skipping...');
    return;
  }
  
  // Create equipment
  const equipmentList = [
    {
      name: 'Treadmill',
      description: 'Motorized running machine for cardiovascular exercise',
      quantity: 5,
      category: 'Cardio',
      trainingType: 'Aerobic',
      isAvailable: true,
      location: 'Cardio Area',
    },
    {
      name: 'Bench Press',
      description: 'Flat bench with barbell rack for chest exercises',
      quantity: 3,
      category: 'Strength',
      trainingType: 'Chest',
      isAvailable: true,
      location: 'Free Weights Area',
    },
    {
      name: 'Dumbbells Set',
      description: 'Set of dumbbells ranging from 5kg to 30kg',
      quantity: 10,
      category: 'Free Weights',
      trainingType: 'Strength',
      isAvailable: true,
      location: 'Free Weights Area',
    },
    {
      name: 'Leg Press Machine',
      description: 'Machine for lower body strength training',
      quantity: 2,
      category: 'Machine',
      trainingType: 'Legs',
      isAvailable: true,
      location: 'Machines Area',
    },
    {
      name: 'Lat Pulldown Machine',
      description: 'Cable machine for back exercises',
      quantity: 2,
      category: 'Machine',
      trainingType: 'Back',
      isAvailable: true,
      location: 'Machines Area',
    },
    {
      name: 'Elliptical Trainer',
      description: 'Low-impact cardio machine',
      quantity: 4,
      category: 'Cardio',
      trainingType: 'Aerobic',
      isAvailable: true,
      location: 'Cardio Area',
    },
    {
      name: 'Yoga Mats',
      description: 'Non-slip mats for yoga and floor exercises',
      quantity: 15,
      category: 'Accessories',
      trainingType: 'Flexibility',
      isAvailable: true,
      location: 'Yoga Area',
    },
    {
      name: 'Kettlebells',
      description: 'Cast iron weights for strength and flexibility training',
      quantity: 8,
      category: 'Free Weights',
      trainingType: 'Full Body',
      isAvailable: true,
      location: 'Free Weights Area',
    },
    {
      name: 'Pull-up Bar',
      description: 'Wall-mounted bar for upper body exercises',
      quantity: 3,
      category: 'Bodyweight',
      trainingType: 'Upper Body',
      isAvailable: true,
      location: 'Functional Area',
    },
    {
      name: 'Exercise Bikes',
      description: 'Stationary bikes for cardio workouts',
      quantity: 4,
      category: 'Cardio',
      trainingType: 'Aerobic',
      isAvailable: true,
      location: 'Cardio Area',
    },
  ];
  
  // Save equipment to database
  for (const equipmentData of equipmentList) {
    const equipment = equipmentRepository.create(equipmentData);
    await equipmentRepository.save(equipment);
    console.log(`Equipment ${equipmentData.name} created`);
  }
  
  console.log('Equipment seeding completed');
}; 