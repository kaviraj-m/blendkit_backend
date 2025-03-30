import { DataSource } from 'typeorm';
import { Quota } from '../../entities';

export const seedQuotas = async (dataSource: DataSource): Promise<void> => {
  const quotaRepository = dataSource.getRepository(Quota);
  
  // Check if quotas already exist
  const quotasCount = await quotaRepository.count();
  if (quotasCount > 0) {
    console.log('Quotas already seeded, skipping...');
    return;
  }
  
  // Create quotas
  const quotas = [
    { 
      name: 'Management', 
      description: 'Management quota'
    },
    { 
      name: 'Government', 
      description: 'Government quota'
    },
  ];
  
  // Save quotas to database
  for (const quotaData of quotas) {
    const quota = quotaRepository.create(quotaData);
    await quotaRepository.save(quota);
    console.log(`Quota ${quotaData.name} created`);
  }
  
  console.log('Quotas seeding completed');
}; 