import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../services/prisma.service';
import { AIRequestStatus } from '@prisma/client';
import { GenerateCalendarDto, TrendingIdeasDto } from './dto/ai-content.dto';

export interface CalendarDay {
  day: number;
  date: string; // YYYY-MM-DD relative placeholder (e.g. "Day 1")
  contentIdea: string;
  suggestedCaption: string;
  suggestedPostType: 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' | 'STORY';
  suggestedTime: string; // HH:MM format
}

@Injectable()
export class ContentCalendarService {
  private readonly logger = new Logger(ContentCalendarService.name);
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateCalendar(
    userId: string,
    dto: GenerateCalendarDto,
  ): Promise<{
    plan: CalendarDay[];
    niche: string;
    days: number;
    disclaimer: string;
  }> {
    const systemPrompt = `You are an expert Instagram content strategist.
Create a detailed ${dto.days}-day Instagram content calendar for the "${dto.niche}" niche.
Return ONLY a valid JSON array (no markdown, no explanation) with exactly ${dto.days} items:
[
  {
    "day": 1,
    "contentIdea": "<specific content idea>",
    "suggestedCaption": "<complete draft caption, no hashtags>",
    "suggestedPostType": "<IMAGE|VIDEO|REEL|CAROUSEL|STORY>",
    "suggestedTime": "<HH:MM in 24h format>"
  },
  ...
]
Rules:
- Vary post types (don't use same type consecutively)
- Mix content pillars: educational, entertaining, inspirational, promotional (80/20 rule)
- Captions should be 50-150 words and feel authentic
- Suggested times should vary but focus on peak hours (8-10, 12-13, 18-21)
- Content ideas should be specific and actionable, not generic`;

    const userPrompt = `Niche: ${dto.niche}\nDays: ${dto.days}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 4000,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? '[]';
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const plan: CalendarDay[] = JSON.parse(cleaned);

      await this.prisma.aIRequest.create({
        data: {
          userId,
          action: 'calendar_generate',
          prompt: userPrompt,
          response: text,
          status: AIRequestStatus.SUCCESS,
          tokenCount:
            (completion.usage?.prompt_tokens ?? 0) + (completion.usage?.completion_tokens ?? 0),
          cost:
            (completion.usage?.prompt_tokens ?? 0) * (0.00015 / 1000) +
            (completion.usage?.completion_tokens ?? 0) * (0.0006 / 1000),
        },
      });

      return {
        plan,
        niche: dto.niche,
        days: dto.days,
        disclaimer:
          'This content calendar is AI-generated for planning purposes only. Review and customize each suggestion before publishing. AI captions should be edited to match your authentic brand voice.',
      };
    } catch (err: any) {
      this.logger.error(`Calendar generation failed: ${err.message}`);
      await this.prisma.aIRequest.create({
        data: {
          userId,
          action: 'calendar_generate',
          prompt: userPrompt,
          response: null,
          status: AIRequestStatus.FAILED,
          errorMessage: err.message,
        },
      });
      throw new InternalServerErrorException(`AI calendar generation failed: ${err.message}`);
    }
  }

  async getTrendingIdeas(
    userId: string,
    dto: TrendingIdeasDto,
  ): Promise<{
    ideas: Array<{ title: string; description: string; format: string; hook: string }>;
    disclaimer: string;
  }> {
    const systemPrompt = `You are an Instagram content trend analyst.
Generate 10 trending content ideas for the given niche based on general knowledge of current Instagram trends.
NOTE: These are AI-generated suggestions based on training data — NOT real-time live trend data.

Return ONLY a valid JSON array:
[
  {
    "title": "<catchy idea title>",
    "description": "<2-3 sentences describing the content>",
    "format": "<IMAGE|VIDEO|REEL|CAROUSEL|STORY>",
    "hook": "<the first 125 characters / opening hook>"
  },
  ...
]`;

    const userPrompt = `Niche: ${dto.niche}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 2000,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? '[]';
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const ideas = JSON.parse(cleaned);

      await this.prisma.aIRequest.create({
        data: {
          userId,
          action: 'trending_ideas',
          prompt: userPrompt,
          response: text,
          status: AIRequestStatus.SUCCESS,
          tokenCount:
            (completion.usage?.prompt_tokens ?? 0) + (completion.usage?.completion_tokens ?? 0),
        },
      });

      return {
        ideas,
        disclaimer:
          'These content ideas are AI-generated suggestions based on general knowledge — not real-time trending data. Verify with current Instagram Explore, Reels, and Hashtag search before publishing.',
      };
    } catch (err: any) {
      this.logger.error(`Trending ideas generation failed: ${err.message}`);
      await this.prisma.aIRequest.create({
        data: {
          userId,
          action: 'trending_ideas',
          prompt: userPrompt,
          response: null,
          status: AIRequestStatus.FAILED,
          errorMessage: err.message,
        },
      });
      throw new InternalServerErrorException(`AI trending ideas generation failed: ${err.message}`);
    }
  }
}
