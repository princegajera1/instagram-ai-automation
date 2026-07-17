import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';

@Controller('api/posts')
@UseGuards(ClerkAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: PostStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.findAll(userId, { status, startDate, endDate, type });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.findOne(userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.remove(userId, id);
  }

  @Post(':id/duplicate')
  duplicate(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.postsService.duplicate(userId, id);
  }
}
