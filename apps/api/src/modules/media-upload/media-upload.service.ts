import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../../services/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);
  private s3: S3Client | null = null;
  private useLocalStorage = false;

  constructor(private readonly prisma: PrismaService) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const region = process.env.AWS_REGION || 'us-east-1';

    // If placeholder credentials, fall back to local storage
    if (
      !accessKeyId ||
      accessKeyId === 'your-aws-access-key-id' ||
      !secretAccessKey ||
      secretAccessKey === 'your-aws-secret-access-key'
    ) {
      this.useLocalStorage = true;
      this.logger.warn('AWS credentials not configured — using local file storage fallback');
    } else {
      this.s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    }
  }

  private validateFile(file: Express.Multer.File) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP images and MP4 videos.`,
      );
    }

    const maxSize = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      throw new BadRequestException(
        `File too large: ${(file.size / (1024 * 1024)).toFixed(1)} MB. Max allowed for ${isVideo ? 'video' : 'image'}: ${maxMB} MB.`,
      );
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<any> {
    this.validateFile(file);

    const ext = path.extname(file.originalname) || '.bin';
    const key = `uploads/${userId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    let url: string;

    if (this.useLocalStorage) {
      // Save locally in apps/api/uploads/
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = path.basename(key);
      const localPath = path.join(uploadDir, filename);
      fs.writeFileSync(localPath, file.buffer);
      url = `http://localhost:4000/uploads/${filename}`;
      this.logger.log(`Saved file locally: ${localPath}`);
    } else {
      const bucket = process.env.AWS_S3_BUCKET_NAME!;
      await this.s3!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      url = `https://${bucket}.s3.amazonaws.com/${key}`;
      this.logger.log(`Uploaded to S3: ${url}`);
    }

    const record = await this.prisma.mediaFile.create({
      data: {
        url,
        s3Key: key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        order: 0,
      },
    });

    return record;
  }
}
