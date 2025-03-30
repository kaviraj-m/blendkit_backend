import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Return all departments', type: [Department] })
  async findAll() {
    return this.departmentsRepository.find({
      relations: ['college'],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Return the department', type: Department })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: number) {
    const department = await this.departmentsRepository.findOne({ 
      where: { id },
      relations: ['college'],
    });
    
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    return department;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department successfully created', type: Department })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department = this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department successfully updated', type: Department })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(@Param('id') id: number, @Body() updateDepartmentDto: Partial<CreateDepartmentDto>) {
    const department = await this.departmentsRepository.findOne({ where: { id } });
    
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    await this.departmentsRepository.update(id, updateDepartmentDto);
    
    return this.departmentsRepository.findOne({ 
      where: { id },
      relations: ['college'],
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department successfully deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id') id: number) {
    const result = await this.departmentsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    return { message: `Department with ID ${id} successfully deleted` };
  }
} 