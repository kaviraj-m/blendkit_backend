import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quota } from '../../entities/quota.entity';
import { CreateQuotaDto } from '../dto/create-quota.dto';

@ApiTags('quotas')
@Controller('quotas')
export class QuotasController {
  constructor(
    @InjectRepository(Quota)
    private readonly quotasRepository: Repository<Quota>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all quotas' })
  @ApiResponse({ status: 200, description: 'Return all quotas', type: [Quota] })
  async findAll() {
    return this.quotasRepository.find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quota by id' })
  @ApiParam({ name: 'id', description: 'Quota ID' })
  @ApiResponse({ status: 200, description: 'Return the quota', type: Quota })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async findOne(@Param('id') id: number) {
    const quota = await this.quotasRepository.findOne({ where: { id } });
    
    if (!quota) {
      throw new NotFoundException(`Quota with ID ${id} not found`);
    }
    
    return quota;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quota' })
  @ApiResponse({ status: 201, description: 'Quota successfully created', type: Quota })
  async create(@Body() createQuotaDto: CreateQuotaDto) {
    const quota = this.quotasRepository.create(createQuotaDto);
    return this.quotasRepository.save(quota);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quota' })
  @ApiParam({ name: 'id', description: 'Quota ID' })
  @ApiResponse({ status: 200, description: 'Quota successfully updated', type: Quota })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async update(@Param('id') id: number, @Body() updateQuotaDto: Partial<CreateQuotaDto>) {
    const quota = await this.quotasRepository.findOne({ where: { id } });
    
    if (!quota) {
      throw new NotFoundException(`Quota with ID ${id} not found`);
    }
    
    await this.quotasRepository.update(id, updateQuotaDto);
    
    return this.quotasRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quota' })
  @ApiParam({ name: 'id', description: 'Quota ID' })
  @ApiResponse({ status: 200, description: 'Quota successfully deleted' })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async remove(@Param('id') id: number) {
    const result = await this.quotasRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Quota with ID ${id} not found`);
    }
    
    return { message: `Quota with ID ${id} successfully deleted` };
  }
} 