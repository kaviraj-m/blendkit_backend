import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, HttpStatus, Query, Req, Logger, ParseIntPipe
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
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

@ApiTags('comments')
@Controller('social/posts/:postId/comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {
    this.logger.log('CommentsController initialized with route: /api/social/posts/:postId/comments');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment on a post' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto, 
    @Req() req: RequestWithUser
  ) {
    this.logger.log(`Creating new comment on post ${postId}: ${JSON.stringify(createCommentDto)}`);
    return this.commentsService.create(postId, createCommentDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all comments for a post' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async findAll(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    this.logger.log(`Request for comments on post ${postId} - Query params: page=${page}, limit=${limit}`);
    
    try {
      return await this.commentsService.findAllForPost(
        postId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
    } catch (error) {
      this.logger.error(`Error fetching comments: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comment not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: RequestWithUser
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comment not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ) {
    return this.commentsService.remove(id, req.user.userId);
  }
} 