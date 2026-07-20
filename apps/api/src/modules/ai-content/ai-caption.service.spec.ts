import { Test, TestingModule } from '@nestjs/testing';
import { AiCaptionService } from './ai-caption.service';
import { PrismaService } from '../../services/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AIRequestStatus } from '@prisma/client';
import { CaptionTone } from './dto/ai-content.dto';

// Mock the OpenAI SDK module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'This is a beautiful sunset over the mountains — pure magic. ✨',
                },
              },
            ],
            usage: {
              prompt_tokens: 120,
              completion_tokens: 30,
              total_tokens: 150,
            },
          }),
        },
      },
    })),
  };
});

// Mock PrismaService
const mockPrismaService = {
  aIRequest: {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({ id: 'mock-ai-request-id' }),
  },
};

describe('AiCaptionService', () => {
  let service: AiCaptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiCaptionService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AiCaptionService>(AiCaptionService);
    jest.clearAllMocks();
    mockPrismaService.aIRequest.count.mockResolvedValue(0);
  });

  it('should generate a caption and log the AIRequest', async () => {
    const result = await service.generateCaption('user-123', {
      topic: 'Sunset photography',
      tone: CaptionTone.MOTIVATIONAL,
    });

    expect(result.caption).toBeDefined();
    expect(typeof result.caption).toBe('string');
    expect(result.caption.length).toBeGreaterThan(0);

    expect(mockPrismaService.aIRequest.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.aIRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-123',
          action: 'caption_generate',
          status: AIRequestStatus.SUCCESS,
        }),
      }),
    );
  });

  it('should throw HttpException when rate limit is exceeded', async () => {
    mockPrismaService.aIRequest.count.mockResolvedValue(30);

    await expect(
      service.generateCaption('user-123', {
        topic: 'Travel blog',
        tone: CaptionTone.PROFESSIONAL,
      }),
    ).rejects.toThrow(HttpException);

    try {
      await service.generateCaption('user-123', {
        topic: 'Travel blog',
        tone: CaptionTone.PROFESSIONAL,
      });
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }

    expect(mockPrismaService.aIRequest.create).not.toHaveBeenCalled();
  });

  it('should include topic and tone in the OpenAI prompt construction', async () => {
    const topic = 'Luxury fashion brand launch';
    const tone = CaptionTone.LUXURY;

    await service.generateCaption('user-456', { topic, tone });

    expect(mockPrismaService.aIRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'caption_generate',
          prompt: expect.stringContaining(topic),
        }),
      }),
    );
  });

  it('should rewrite a caption and log action=caption_rewrite', async () => {
    const result = await service.rewriteCaption('user-789', {
      caption: 'Great photo from my trip.',
      tone: CaptionTone.FUNNY,
    });

    expect(result.caption).toBeDefined();
    expect(mockPrismaService.aIRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'caption_rewrite',
          status: AIRequestStatus.SUCCESS,
        }),
      }),
    );
  });

  it('should return correct usage stats', async () => {
    mockPrismaService.aIRequest.count.mockResolvedValue(12);

    const stats = await service.getUsageStats('user-123');

    expect(stats.requestsThisHour).toBe(12);
    expect(stats.limit).toBe(30);
    expect(stats.remaining).toBe(18);
  });
});
