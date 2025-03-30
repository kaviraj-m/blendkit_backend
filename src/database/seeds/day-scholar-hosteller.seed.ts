import { DataSource } from 'typeorm';
import { DayScholarHosteller } from '../../entities';

export const seedDayScholarHostellers = async (dataSource: DataSource): Promise<void> => {
  const dayScholarHostellerRepository = dataSource.getRepository(DayScholarHosteller);
  
  // Check if day scholar/hosteller options already exist
  const dayScholarHostellersCount = await dayScholarHostellerRepository.count();
  if (dayScholarHostellersCount > 0) {
    console.log('Day Scholar/Hosteller options already seeded, skipping...');
    return;
  }
  
  // Create day scholar/hosteller options
  const dayScholarHostellers = [
    { 
      type: 'Day Scholar', 
      description: 'Student who commutes daily'
    },
    { 
      type: 'Hosteller', 
      description: 'Student who stays in hostel'
    },
  ];
  
  // Save day scholar/hosteller options to database
  for (const dayScholarHostellerData of dayScholarHostellers) {
    const dayScholarHosteller = dayScholarHostellerRepository.create(dayScholarHostellerData);
    await dayScholarHostellerRepository.save(dayScholarHosteller);
    console.log(`Day Scholar/Hosteller option ${dayScholarHostellerData.type} created`);
  }
  
  console.log('Day Scholar/Hosteller options seeding completed');
}; 