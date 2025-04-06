import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('equipment')
@Controller(['gym/equipment', 'equipment'])
export class EquipmentController {
  private readonly logger = new Logger(EquipmentController.name);

  constructor(private readonly equipmentService: EquipmentService) {
    this.logger.log('EquipmentController initialized with routes: /api/equipment and /api/gym/equipment');
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint to diagnose equipment API issues' })
  async testEquipment() {
    this.logger.log('Test endpoint called to diagnose equipment API');
    
    try {
      // Try multiple approaches to get equipment data
      const results = {
        standardFind: await this.equipmentService.findAll(),
        directQuery: await this.equipmentService.testDirectQuery(),
        entityInfo: await this.equipmentService.getEntityInfo()
      };
      
      this.logger.log(`Test results: Standard find returned ${results.standardFind.length} items, direct query returned ${results.directQuery.length} items`);
      
      return {
        success: true,
        message: 'Equipment API test results',
        tableUsed: 'equipments',
        ...results
      };
    } catch (error) {
      this.logger.error(`Error in test endpoint: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new equipment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Equipment created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all equipment' })
  async findAll() {
    this.logger.log('Received request to get all equipment');
    try {
      const equipment = await this.equipmentService.findAll();
      this.logger.log(`Found ${equipment?.length || 0} equipment items`);
      
      // Ensure we're returning an array even if service returns null/undefined
      return equipment || [];
    } catch (error) {
      this.logger.error(`Error fetching equipment: ${error.message}`, error.stack);
      
      // Return empty array instead of throwing error to client
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return equipment by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipment not found' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update equipment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Equipment updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipment not found' })
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete equipment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Equipment deleted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipment not found' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
} 