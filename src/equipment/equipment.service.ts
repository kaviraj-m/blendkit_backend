import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { Equipment } from '../entities/equipment.entity';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {
    // Log diagnostic information on initialization
    this.logDatabaseInfo();
  }

  private async logDatabaseInfo() {
    try {
      // Check available tables
      this.logger.log('Checking database tables...');
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      const tables = await this.equipmentRepository.query(tablesQuery);
      this.logger.log(`Available tables: ${JSON.stringify(tables)}`);
      
      // Check equipment table columns
      const columnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'equipments'
        ORDER BY ordinal_position;
      `;
      
      const columns = await this.equipmentRepository.query(columnsQuery);
      this.logger.log(`Equipment table columns: ${JSON.stringify(columns)}`);
    } catch (error) {
      this.logger.error(`Error checking database info: ${error.message}`);
    }
  }

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async findAll(): Promise<Equipment[]> {
    this.logger.log('Finding all equipment');
    try {
      const equipment = await this.equipmentRepository.find();
      this.logger.log(`Found ${equipment.length} equipment items`);
      
      // If no equipment is found, log the repository metadata
      if (equipment.length === 0) {
        const metadata = this.equipmentRepository.metadata;
        this.logger.log('Equipment repository metadata:');
        this.logger.log(`- Entity name: ${metadata.name}`);
        this.logger.log(`- Table name: ${metadata.tableName}`);
        this.logger.log(`- Database: ${metadata.connection.options.database}`);
        this.logger.log(`- Columns: ${metadata.columns.map(c => c.propertyName).join(', ')}`);
      }
      
      return equipment;
    } catch (error) {
      this.logger.error(`Error finding equipment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Equipment> {
    this.logger.log(`Fetching equipment with ID: ${id}`);
    
    try {
      // Try direct SQL query first
      const sqlQuery = `SELECT * FROM equipments WHERE id = $1`;
      this.logger.log(`Executing SQL query: ${sqlQuery} with ID: ${id}`);
      
      const rawResult = await this.equipmentRepository.query(sqlQuery, [id]);
      this.logger.log(`SQL query result: ${JSON.stringify(rawResult)}`);
      
      if (rawResult && rawResult.length > 0) {
        return rawResult[0];
      }
      
      // Fallback to repository method
      const equipment = await this.equipmentRepository.findOne({ where: { id } });
      if (!equipment) {
        this.logger.warn(`Equipment with ID ${id} not found`);
        throw new NotFoundException(`Equipment with ID ${id} not found`);
      }
      
      return equipment;
    } catch (error) {
      this.logger.error(`Error fetching equipment with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);
    this.equipmentRepository.merge(equipment, updateEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: number): Promise<void> {
    const equipment = await this.findOne(id);
    await this.equipmentRepository.remove(equipment);
  }

  async testDirectQuery(): Promise<any[]> {
    this.logger.log('Running test direct query for diagnostics');
    
    // Focus on 'equipments' table based on confirmed table name
    const testResults: any[] = [];
    
    try {
      // Primary test: Use the 'equipments' table
      const query = `SELECT * FROM equipments LIMIT 10`;
      const results = await this.equipmentRepository.query(query);
      this.logger.log(`equipments table query: ${JSON.stringify(results)}`);
      
      if (Array.isArray(results) && results.length > 0) {
        results.forEach(item => testResults.push(item));
      } else {
        this.logger.warn('No results found in equipments table');
      }
      
      // Get column information
      const columnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_name = 'equipments'
        ORDER BY c.ordinal_position;
      `;
      
      const columnsInfo = await this.equipmentRepository.query(columnsQuery);
      this.logger.log(`Column information for equipments table: ${JSON.stringify(columnsInfo)}`);
      
    } catch (e) {
      this.logger.error(`Error querying equipments table: ${e.message}`);
    }
    
    return testResults;
  }

  async getEntityInfo(): Promise<any> {
    const connection = this.equipmentRepository.manager.connection;
    const entities = connection.entityMetadatas;
    
    return {
      allEntities: entities.map(entity => ({
        name: entity.name,
        tableName: entity.tableName,
        columns: entity.columns.map(column => ({
          propertyName: column.propertyName,
          databaseName: column.databaseName,
          type: column.type
        }))
      })),
      equipmentEntity: entities.find(e => e.name === 'Equipment' || e.name === 'equipment'),
      databaseType: connection.options.type,
      database: connection.options.database
    };
  }
} 