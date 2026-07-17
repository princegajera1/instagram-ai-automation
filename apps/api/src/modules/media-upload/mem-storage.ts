import { memoryStorage } from 'multer';

// Use memory storage so files are available as buffers for S3 or local disk writes
export const memStorage = memoryStorage();
