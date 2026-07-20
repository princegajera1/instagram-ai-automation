import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../services/prisma.service';
import { AIRequestStatus } from '@prisma/client';
import {
  CaptionTone,
  GenerateCaptionDto,
  RewriteCaptionDto,
  GenerateHashtagsDto,
  EmojiSuggestDto,
  CtaSuggestDto,
  SeoCaptionDto,
  EngagementScoreDto,
} from './dto/ai-content.dto';

// GPT-4o-mini pricing (as of 2024) — used for cost estimation only
const COST_PER_1K_INPUT_TOKENS = 0.00015;
const COST_PER_1K_OUTPUT_TOKENS = 0.0006;

// Per-user rate limit: max AI requests per hour
const MAX_REQUESTS_PER_HOUR = 30;

@Injectable()
export class AiCaptionService {
  private readonly logger = new Logger(AiCaptionService.name);
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ─── Rate limit check ─────────────────────────────────────────────────────
  private async checkRateLimit(userId: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.prisma.aIRequest.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
        status: AIRequestStatus.SUCCESS,
      },
    });
    if (count >= MAX_REQUESTS_PER_HOUR) {
      throw new HttpException(
        `AI rate limit reached: ${MAX_REQUESTS_PER_HOUR} requests per hour. Please wait and try again.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  // ─── Log AI request to DB ─────────────────────────────────────────────────
  private async logRequest(
    userId: string,
    action: string,
    prompt: string,
    response: string | null,
    status: AIRequestStatus,
    usage?: { prompt_tokens?: number; completion_tokens?: number },
    errorMessage?: string,
  ): Promise<void> {
    try {
      const totalTokens = (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0);
      const cost =
        (usage?.prompt_tokens ?? 0) * (COST_PER_1K_INPUT_TOKENS / 1000) +
        (usage?.completion_tokens ?? 0) * (COST_PER_1K_OUTPUT_TOKENS / 1000);

      await this.prisma.aIRequest.create({
        data: {
          userId,
          action,
          prompt,
          response,
          status,
          tokenCount: totalTokens || null,
          cost: cost || null,
          errorMessage: errorMessage || null,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log AI request: ${err.message}`);
    }
  }

  // ─── Core chat helper ────────────────────────────────────────────────────
  private async chat(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<{ text: string; usage?: any }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? '';
    return { text, usage: completion.usage };
  }

  // ─── 1. Generate Caption ─────────────────────────────────────────────────
  async generateCaption(userId: string, dto: GenerateCaptionDto): Promise<{ caption: string }> {
    await this.checkRateLimit(userId);

    const tone = dto.tone ?? CaptionTone.PROFESSIONAL;
    const systemPrompt = `You are an expert Instagram content writer. Write engaging, authentic Instagram captions.
Tone: ${tone}
Rules:
- For SHORT tone: keep under 50 words
- For LONG tone: 150-200 words with storytelling
- For FUNNY: add wit and relatable humor
- For MOTIVATIONAL: inspiring and energizing
- For LUXURY: aspirational, elevated language
- For PROFESSIONAL/BUSINESS: clear, credible, action-oriented
- Do NOT include hashtags (they go in a separate field)
- Do NOT include quotation marks around the caption
- Output ONLY the caption text`;

    const userPrompt = `Topic/description: ${dto.topic}`;

    let result = '';
    let usage: any;
    try {
      ({ text: result, usage } = await this.chat(systemPrompt, userPrompt));
      await this.logRequest(
        userId,
        'caption_generate',
        userPrompt,
        result,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return { caption: result };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'caption_generate',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI caption generation failed: ${err.message}`);
    }
  }

  // ─── 2. Rewrite Caption ──────────────────────────────────────────────────
  async rewriteCaption(userId: string, dto: RewriteCaptionDto): Promise<{ caption: string }> {
    await this.checkRateLimit(userId);

    const systemPrompt = `You are an expert Instagram caption editor.
Rewrite the provided caption in the specified tone while preserving the core message.
Tone: ${dto.tone}
Rules:
- Output ONLY the rewritten caption text
- Do NOT include hashtags
- Do NOT wrap in quotes`;

    const userPrompt = `Original caption:\n${dto.caption}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      await this.logRequest(
        userId,
        'caption_rewrite',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return { caption: text };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'caption_rewrite',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI caption rewrite failed: ${err.message}`);
    }
  }

  // ─── 3. Generate Hashtags ────────────────────────────────────────────────
  async generateHashtags(
    userId: string,
    dto: GenerateHashtagsDto,
  ): Promise<{
    high: string[];
    medium: string[];
    low: string[];
    note: string;
  }> {
    await this.checkRateLimit(userId);

    // NOTE: Hashtag competition grouping is AI-estimated based on general knowledge
    // of Instagram content. This is NOT live hashtag volume data from any real-time API.
    const systemPrompt = `You are an Instagram hashtag strategy expert.
Generate 25 relevant Instagram hashtags for the given topic.
Group them as follows (AI-estimated competition — not live data):
- HIGH_COMPETITION: 8 hashtags (very popular, millions of posts, broad reach, harder to rank)
- MEDIUM_COMPETITION: 10 hashtags (moderate popularity, hundreds of thousands of posts)
- LOW_COMPETITION: 7 hashtags (niche specific, tens of thousands of posts, easier to rank)

Return ONLY valid JSON in this exact format:
{
  "high": ["#tag1", "#tag2", ...],
  "medium": ["#tag3", "#tag4", ...],
  "low": ["#tag5", "#tag6", ...]
}`;

    const userPrompt = `Topic/caption: ${dto.captionOrTopic}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      // Parse JSON from response (handle potential markdown code fences)
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      await this.logRequest(
        userId,
        'hashtags_generate',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return {
        high: parsed.high ?? [],
        medium: parsed.medium ?? [],
        low: parsed.low ?? [],
        note: 'Hashtag competition groups are AI-estimated based on general knowledge — not live Instagram data.',
      };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'hashtags_generate',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI hashtag generation failed: ${err.message}`);
    }
  }

  // ─── 4. Emoji Suggestions ────────────────────────────────────────────────
  async suggestEmojis(
    userId: string,
    dto: EmojiSuggestDto,
  ): Promise<{
    emojis: string[];
    suggested_caption: string;
  }> {
    await this.checkRateLimit(userId);

    const systemPrompt = `You are an Instagram engagement expert specializing in emoji strategy.
Given a caption, suggest relevant emojis and return a version of the caption with emojis naturally woven in.
Return ONLY valid JSON:
{
  "emojis": ["list", "of", "recommended", "emojis"],
  "suggested_caption": "the caption with emojis tastefully added"
}`;

    const userPrompt = `Caption: ${dto.caption}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      await this.logRequest(
        userId,
        'emoji_suggest',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return {
        emojis: parsed.emojis ?? [],
        suggested_caption: parsed.suggested_caption ?? dto.caption,
      };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'emoji_suggest',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI emoji suggestion failed: ${err.message}`);
    }
  }

  // ─── 5. CTA Suggestions ──────────────────────────────────────────────────
  async suggestCta(userId: string, dto: CtaSuggestDto): Promise<{ ctas: string[] }> {
    await this.checkRateLimit(userId);

    const systemPrompt = `You are a conversion copywriter specializing in Instagram CTAs.
Generate 5 compelling call-to-action lines appropriate for an Instagram post.
Return ONLY valid JSON:
{ "ctas": ["cta1", "cta2", "cta3", "cta4", "cta5"] }
Each CTA should be 1-2 sentences, punchy, and action-oriented.`;

    const userPrompt = `Post topic/goal: ${dto.topicOrGoal}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      await this.logRequest(
        userId,
        'cta_suggest',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return { ctas: parsed.ctas ?? [] };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'cta_suggest',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI CTA suggestion failed: ${err.message}`);
    }
  }

  // ─── 6. SEO Caption ──────────────────────────────────────────────────────
  async generateSeoCaption(
    userId: string,
    dto: SeoCaptionDto,
  ): Promise<{ caption: string; keywords: string[] }> {
    await this.checkRateLimit(userId);

    const systemPrompt = `You are an Instagram SEO specialist.
Generate an SEO-optimized Instagram caption that naturally incorporates searchable keywords.
Instagram search favors captions with relevant keywords in the first 125 characters.
Return ONLY valid JSON:
{
  "caption": "the SEO-optimized caption",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const userPrompt = dto.existingCaption
      ? `Topic: ${dto.topic}\nExisting caption to optimize: ${dto.existingCaption}`
      : `Topic: ${dto.topic}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      await this.logRequest(
        userId,
        'seo_caption',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return { caption: parsed.caption ?? '', keywords: parsed.keywords ?? [] };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'seo_caption',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI SEO caption generation failed: ${err.message}`);
    }
  }

  // ─── 7. Engagement Score ─────────────────────────────────────────────────
  async scoreEngagement(
    userId: string,
    dto: EngagementScoreDto,
  ): Promise<{
    score: number;
    reasoning: string;
    tips: string[];
    disclaimer: string;
  }> {
    await this.checkRateLimit(userId);

    const systemPrompt = `You are an Instagram engagement analyst.
Evaluate the provided caption (and optional hashtags) and give an AI-estimated engagement potential score.
This is an AI estimation — NOT a guarantee or prediction based on real account data.
Return ONLY valid JSON:
{
  "score": <number 1-100>,
  "reasoning": "<2-3 sentence explanation of the score>",
  "tips": ["<specific improvement tip>", "<another tip>"]
}`;

    const userPrompt = `Caption: ${dto.caption}${dto.hashtags ? `\nHashtags: ${dto.hashtags}` : ''}`;

    try {
      const { text, usage } = await this.chat(systemPrompt, userPrompt);
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      await this.logRequest(
        userId,
        'engagement_score',
        userPrompt,
        text,
        AIRequestStatus.SUCCESS,
        usage,
      );
      return {
        score: Math.min(100, Math.max(1, parsed.score ?? 50)),
        reasoning: parsed.reasoning ?? '',
        tips: parsed.tips ?? [],
        disclaimer:
          'This engagement score is an AI-generated estimate for guidance only. Actual performance depends on many real-world factors including account size, audience, posting time, and content quality.',
      };
    } catch (err: any) {
      await this.logRequest(
        userId,
        'engagement_score',
        userPrompt,
        null,
        AIRequestStatus.FAILED,
        undefined,
        err.message,
      );
      throw new InternalServerErrorException(`AI engagement scoring failed: ${err.message}`);
    }
  }

  // ─── Usage stats for the current user ───────────────────────────────────
  async getUsageStats(
    userId: string,
  ): Promise<{ requestsThisHour: number; limit: number; remaining: number }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.prisma.aIRequest.count({
      where: { userId, createdAt: { gte: oneHourAgo }, status: AIRequestStatus.SUCCESS },
    });
    return {
      requestsThisHour: count,
      limit: MAX_REQUESTS_PER_HOUR,
      remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - count),
    };
  }
}
