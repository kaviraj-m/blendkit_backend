import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, HttpStatus, Query, Req, Logger, ParseIntPipe
} from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { CreateSocialPostDto, UpdateSocialPostDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

// Define the User interface for the Request
interface RequestWithUser extends Request {
  user: {
    userId: number;
    [key: string]: any;
  };
}

@ApiTags('social-posts')
@Controller('social/posts')
export class SocialPostsController {
  private readonly logger = new Logger(SocialPostsController.name);

  constructor(private readonly socialPostsService: SocialPostsService) {
    this.logger.log('SocialPostsController initialized with route: /api/social/posts');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new social post' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Social post created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  create(@Body() createSocialPostDto: CreateSocialPostDto, @Req() req: RequestWithUser) {
    this.logger.log(`Creating new social post: ${JSON.stringify(createSocialPostDto)}`);
    return this.socialPostsService.create(createSocialPostDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all social posts with optional filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all social posts' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by post category' })
  @ApiQuery({ name: 'user_id', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async findAll(
    @Query('category') category?: string,
    @Query('user_id') userId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: Request
  ) {
    this.logger.log(`Request for social posts - Query params: category=${category}, userId=${userId}, page=${page}, limit=${limit}`);
    
    try {
      return await this.socialPostsService.findAll(
        category, 
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
    } catch (error) {
      this.logger.error(`Error fetching social posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get social posts for feed' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return feed posts' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getFeed(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    this.logger.log(`Request for social feed - Query params: page=${page}, limit=${limit}`);
    
    try {
      return await this.socialPostsService.getPostsForFeed(
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        req.user.userId
      );
    } catch (error) {
      this.logger.error(`Error fetching social feed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social post by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return social post by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Social post not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.socialPostsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update social post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Social post updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Social post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateSocialPostDto: UpdateSocialPostDto,
    @Req() req: RequestWithUser
  ) {
    return this.socialPostsService.update(id, updateSocialPostDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete social post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Social post deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Social post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.socialPostsService.remove(id, req.user.userId);
  }
} 