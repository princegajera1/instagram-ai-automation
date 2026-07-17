import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { InstagramPublishService } from './instagram-publish.service';

@Controller('api/instagram')
export class InstagramPublishController {
  constructor(private readonly publishService: InstagramPublishService) {}

  @Post('publish')
  @UseGuards(ClerkAuthGuard)
  async publishPost(@Body('postId') postId?: string) {
    if (!postId) {
      throw new BadRequestException('postId is required');
    }

    // Verify the post belongs to the authenticated user first
    const post = await this.publishService.publishPost(postId);
    return { success: true, instagramMediaId: post };
  }
}
