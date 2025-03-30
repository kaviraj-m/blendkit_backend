import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

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
  findAll() {
    return this.equipmentService.findAll();
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