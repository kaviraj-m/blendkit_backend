import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'equipments' })
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ nullable: true, name: 'imageUrl' })
  imageUrl: string;

  @Column({ nullable: true, name: 'category' })
  category: string;

  @Column({ nullable: true, name: 'trainingType' })
  trainingType: string;

  @Column({ default: true, name: 'isAvailable' })
  isAvailable: boolean;

  @Column({ nullable: true, name: 'location' })
  location: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'createdAt' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updatedAt' })
  updatedAt: Date;
} 