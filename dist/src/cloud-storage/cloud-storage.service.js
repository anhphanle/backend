"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_1 = require("@google-cloud/storage");
const uuid_1 = require("uuid");
const stream_1 = require("stream");
let CloudStorageService = CloudStorageService_1 = class CloudStorageService {
    configService;
    logger = new common_1.Logger(CloudStorageService_1.name);
    storage;
    bucket;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        const keyFilename = this.configService.getOrThrow('GCS_KEYFILE_PATH');
        this.bucketName = this.configService.getOrThrow('GCS_BUCKET_NAME');
        const projectId = this.configService.getOrThrow('GCS_PROJECT_ID');
        try {
            this.storage = new storage_1.Storage({
                keyFilename: keyFilename,
                projectId: projectId,
            });
            this.bucket = this.storage.bucket(this.bucketName);
            this.logger.log(`Connected to GCS Bucket: ${this.bucketName}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize Google Cloud Storage: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to connect to Google Cloud Storage.');
        }
    }
    async uploadFile(fileBuffer, originalname, mimetype, destinationFolder = 'product-images/') {
        const uniqueSuffix = (0, uuid_1.v4)();
        const extension = originalname.includes('.')
            ? originalname.substring(originalname.lastIndexOf('.'))
            : '';
        const filename = `${destinationFolder}${uniqueSuffix}${extension}`;
        const file = this.bucket.file(filename);
        const stream = file.createWriteStream({
            metadata: {
                contentType: mimetype,
            },
            resumable: false,
        });
        return new Promise((resolve, reject) => {
            stream.on('error', (err) => {
                this.logger.error(`GCS Upload Error for ${filename}: ${err.message}`, err.stack);
                reject(new common_1.InternalServerErrorException(`Failed to upload file to GCS: ${err.message}`));
            });
            stream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
                this.logger.log(`File ${filename} uploaded successfully to GCS. URL: ${publicUrl}`);
                resolve(publicUrl);
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(stream);
        });
    }
    async deleteFile(filename) {
        const prefix = `https://storage.googleapis.com/${this.bucketName}/`;
        if (!filename.startsWith(prefix)) {
            this.logger.warn(`Cannot delete file: URL ${filename} does not match bucket prefix.`);
            return;
        }
        const gcsFilename = filename.substring(prefix.length);
        const file = this.bucket.file(gcsFilename);
        try {
            await file.delete();
            this.logger.log(`File ${gcsFilename} deleted successfully from GCS.`);
        }
        catch (error) {
            if (error.code === 404) {
                this.logger.warn(`File ${gcsFilename} not found in GCS for deletion, skipping.`);
                return;
            }
            this.logger.error(`Failed to delete file ${gcsFilename} from GCS: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to delete file from GCS: ${error.message}`);
        }
    }
    async getSignedUrl(filename, durationMinutes = 15) {
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + durationMinutes * 60 * 1000,
        };
        try {
            const [url] = await this.bucket.file(filename).getSignedUrl(options);
            this.logger.log(`Generated signed URL for ${filename}`);
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL for ${filename}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Could not generate signed URL.');
        }
    }
};
exports.CloudStorageService = CloudStorageService;
exports.CloudStorageService = CloudStorageService = CloudStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudStorageService);
//# sourceMappingURL=cloud-storage.service.js.map