import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Query, Req, Logger } from '@nestjs/common';
import { GymPostsService } from './gym-posts.service';
import { CreateGymPostDto } from './dto/create-gym-post.dto';
import { UpdateGymPostDto } from './dto/update-gym-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('gym-posts')
@Controller('gym/posts')
export class GymPostsController {
  private readonly logger = new Logger(GymPostsController.name);

  constructor(private readonly gymPostsService: GymPostsService) {
    this.logger.log('GymPostsController initialized with route: /api/gym/posts');
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new gym post' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Gym post created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  create(@Body() createGymPostDto: CreateGymPostDto, @Req() req: Request) {
    return this.gymPostsService.create(createGymPostDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gym posts with optional filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all gym posts' })
  async findAll(
    @Query('bodyType') bodyType?: string,
    @Query('exerciseType') exerciseType?: string,
    @Query('isActive') isActive?: boolean,
    @Req() req?: Request
  ) {
    this.logger.log(`Request for gym posts - Query params: bodyType=${bodyType}, exerciseType=${exerciseType}, isActive=${isActive}`);
    this.logger.log(`Request headers: ${JSON.stringify(req?.headers)}`);
    
    try {
      const posts = await this.gymPostsService.findAll(bodyType, exerciseType, isActive);
      this.logger.log(`Found ${posts.length} posts`);
      return posts;
    } catch (error) {
      this.logger.error(`Error fetching gym posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gym post by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return gym post by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym post not found' })
  findOne(@Param('id') id: string) {
    return this.gymPostsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gym post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gym post updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  update(@Param('id') id: string, @Body() updateGymPostDto: UpdateGymPostDto) {
    return this.gymPostsService.update(+id, updateGymPostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete gym post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gym post deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  remove(@Param('id') id: string) {
    return this.gymPostsService.remove(+id);
  }

  @Get('body-type/:type')
  @ApiOperation({ summary: 'Get gym posts by body type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return gym posts by body type' })
  findByBodyType(@Param('type') type: string) {
    return this.gymPostsService.findByBodyType(type);
  }
} 