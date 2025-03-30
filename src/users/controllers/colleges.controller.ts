import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from '../../entities/college.entity';
import { CreateCollegeDto } from '../dto/create-college.dto';

@ApiTags('colleges')
@Controller('colleges')
export class CollegesController {
  constructor(
    @InjectRepository(College)
    private readonly collegesRepository: Repository<College>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all colleges' })
  @ApiResponse({ status: 200, description: 'Return all colleges', type: [College] })
  async findAll() {
    return this.collegesRepository.find({
      relations: ['departments'],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a college by id' })
  @ApiParam({ name: 'id', description: 'College ID' })
  @ApiResponse({ status: 200, description: 'Return the college', type: College })
  @ApiResponse({ status: 404, description: 'College not found' })
  async findOne(@Param('id') id: number) {
    const college = await this.collegesRepository.findOne({ 
      where: { id },
      relations: ['departments'],
    });
    
    if (!college) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }
    
    return college;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new college' })
  @ApiResponse({ status: 201, description: 'College successfully created', type: College })
  async create(@Body() createCollegeDto: CreateCollegeDto) {
    const college = this.collegesRepository.create(createCollegeDto);
    return this.collegesRepository.save(college);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a college' })
  @ApiParam({ name: 'id', description: 'College ID' })
  @ApiResponse({ status: 200, description: 'College successfully updated', type: College })
  @ApiResponse({ status: 404, description: 'College not found' })
  async update(@Param('id') id: number, @Body() updateCollegeDto: Partial<CreateCollegeDto>) {
    const college = await this.collegesRepository.findOne({ where: { id } });
    
    if (!college) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }
    
    await this.collegesRepository.update(id, updateCollegeDto);
    
    return this.collegesRepository.findOne({ 
      where: { id },
      relations: ['departments'],
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a college' })
  @ApiParam({ name: 'id', description: 'College ID' })
  @ApiResponse({ status: 200, description: 'College successfully deleted' })
  @ApiResponse({ status: 404, description: 'College not found' })
  async remove(@Param('id') id: number) {
    const result = await this.collegesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }
    
    return { message: `College with ID ${id} successfully deleted` };
  }
} 