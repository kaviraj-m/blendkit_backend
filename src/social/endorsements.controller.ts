import { 
  Controller, Post, Delete, Param, 
  UseGuards, HttpStatus, Query, Req, Logger, ParseIntPipe, Get
} from '@nestjs/common';
import { EndorsementsService } from './endorsements.service';
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

@ApiTags('endorsements')
@Controller('social/posts/:postId/endorsements')
export class EndorsementsController {
  private readonly logger = new Logger(EndorsementsController.name);

  constructor(private readonly endorsementsService: EndorsementsService) {
    this.logger.log('EndorsementsController initialized with route: /api/social/posts/:postId/endorsements');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endorse a post' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Post endorsed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User has already endorsed this post' })
  endorse(@Param('postId', ParseIntPipe) postId: number, @Req() req: RequestWithUser) {
    this.logger.log(`User ${req.user.userId} endorsing post ${postId}`);
    return this.endorsementsService.endorsePost(postId, req.user.userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove endorsement from a post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Endorsement removed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Endorsement not found' })
  removeEndorsement(@Param('postId', ParseIntPipe) postId: number, @Req() req: RequestWithUser) {
    this.logger.log(`User ${req.user.userId} removing endorsement for post ${postId}`);
    return this.endorsementsService.removeEndorsement(postId, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all endorsements for a post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all endorsements for a post' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  async getEndorsements(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string
  ) {
    this.logger.log(`Request for endorsements for post ${postId} - Query params: page=${page}, limit=${limit}, role=${role}`);
    
    try {
      return await this.endorsementsService.getEndorsementsForPost(
        postId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        role
      );
    } catch (error) {
      this.logger.error(`Error fetching endorsements: ${error.message}`, error.stack);
      throw error;
    }
  }
} 