import { ConfigService } from '@nestjs/config';
export declare class CloudStorageService {
    private configService;
    private readonly logger;
    private storage;
    private bucket;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(fileBuffer: Buffer, originalname: string, mimetype: string, destinationFolder?: string): Promise<string>;
    deleteFile(filename: string): Promise<void>;
    getSignedUrl(filename: string, durationMinutes?: number): Promise<string>;
}
