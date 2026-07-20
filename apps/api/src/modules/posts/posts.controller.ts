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

/** Helper to extract userId from req.user regardless of field name */
function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || req.user?.userId || 'anonymous';
}

@Controller('api/posts')
@UseGuards(ClerkAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(getUserId(req), dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: PostStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.postsService.findAll(getUserId(req), { status, startDate, endDate, type });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.postsService.findOne(getUserId(req), id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(getUserId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.postsService.remove(getUserId(req), id);
  }

  @Post(':id/duplicate')
  duplicate(@Req() req: any, @Param('id') id: string) {
    return this.postsService.duplicate(getUserId(req), id);
  }
}
