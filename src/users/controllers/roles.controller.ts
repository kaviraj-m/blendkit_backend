import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles', type: [Role] })
  async findAll() {
    return this.rolesRepository.find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Return the role', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: number) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created', type: Role })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role successfully updated', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(@Param('id') id: number, @Body() updateRoleDto: Partial<CreateRoleDto>) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    await this.rolesRepository.update(id, updateRoleDto);
    
    return this.rolesRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') id: number) {
    const result = await this.rolesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return { message: `Role with ID ${id} successfully deleted` };
  }
} 