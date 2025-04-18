import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage, Bucket, File } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class CloudStorageService {
  private readonly logger = new Logger(CloudStorageService.name);
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Sử dụng getOrThrow để đảm bảo các biến môi trường bắt buộc phải có giá trị
    // và kiểu trả về sẽ là string (hoặc lỗi sẽ được ném ra)
    const keyFilename =
      this.configService.getOrThrow<string>('GCS_KEYFILE_PATH');
    this.bucketName = this.configService.getOrThrow<string>('GCS_BUCKET_NAME');
    const projectId = this.configService.getOrThrow<string>('GCS_PROJECT_ID');

    // Không cần check thủ công nữa vì getOrThrow đã làm việc đó
    // if (!keyFilename || !this.bucketName || !projectId) {
    //   this.logger.error('GCS configuration (keyfile, bucket name, project ID) is missing in .env');
    //   throw new InternalServerErrorException('Google Cloud Storage is not configured.');
    // }

    try {
      this.storage = new Storage({
        keyFilename: keyFilename, // Bây giờ chắc chắn là string
        projectId: projectId, // Bây giờ chắc chắn là string
      });
      this.bucket = this.storage.bucket(this.bucketName); // Bây giờ chắc chắn là string
      this.logger.log(`Connected to GCS Bucket: ${this.bucketName}`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize Google Cloud Storage: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to connect to Google Cloud Storage.',
      );
    }
  }

  /**
   * Uploads a file buffer to GCS.
   * @param fileBuffer The file content as a Buffer.
   * @param originalname The original name of the file.
   * @param mimetype The MIME type of the file.
   * @param destinationFolder The folder path within the bucket (e.g., 'product-images/').
   * @returns The public URL of the uploaded file.
   * @throws InternalServerErrorException if upload fails.
   * @throws BadRequestException if file type is invalid (optional check).
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalname: string,
    mimetype: string,
    destinationFolder: string = 'product-images/', // Mặc định thư mục
  ): Promise<string> {
    // (Tùy chọn) Kiểm tra kiểu file nếu cần
    // const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    // if (!allowedMimeTypes.includes(mimetype)) {
    //     throw new BadRequestException(`Invalid file type: ${mimetype}. Only images are allowed.`);
    // }

    const uniqueSuffix = uuidv4();
    // Giữ phần extension của file gốc
    const extension = originalname.includes('.')
      ? originalname.substring(originalname.lastIndexOf('.'))
      : '';
    const filename = `${destinationFolder}${uniqueSuffix}${extension}`;

    const file = this.bucket.file(filename);

    const stream = file.createWriteStream({
      metadata: {
        contentType: mimetype,
        // Có thể thêm metadata khác nếu cần
        // metadata: { custom: 'metadata' }
      },
      // public: true, // Đặt public nếu bucket của bạn không public mặc định và bạn muốn URL trực tiếp
      resumable: false, // Tắt resumable cho file nhỏ, có thể nhanh hơn
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        this.logger.error(
          `GCS Upload Error for ${filename}: ${err.message}`,
          err.stack,
        );
        reject(
          new InternalServerErrorException(
            `Failed to upload file to GCS: ${err.message}`,
          ),
        );
      });

      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
        this.logger.log(
          `File ${filename} uploaded successfully to GCS. URL: ${publicUrl}`,
        );
        resolve(publicUrl); // Trả về URL công khai (đảm bảo bucket/object có quyền đọc public)
        // Hoặc trả về filename và tạo Signed URL khi cần truy cập
        // resolve(filename);
      });

      // Ghi buffer vào stream
      // stream.end(fileBuffer); // Cách 1

      // Cách 2: Dùng Readable stream (có thể tốt hơn cho file lớn)
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null); // Signal end of stream
      readableStream.pipe(stream);
    });
  }

  /**
   * Deletes a file from GCS using its filename (path within the bucket).
   * @param filename The full path of the file within the bucket (e.g., 'product-images/uuid.jpg').
   * @throws InternalServerErrorException if deletion fails.
   */
  async deleteFile(filename: string): Promise<void> {
    // Cần lấy filename (path trong bucket) từ image_url lưu trong DB
    // Ví dụ: URL là https://storage.googleapis.com/my-bucket/product-images/uuid.jpg
    // Filename cần lấy là 'product-images/uuid.jpg'
    const prefix = `https://storage.googleapis.com/${this.bucketName}/`;
    if (!filename.startsWith(prefix)) {
      this.logger.warn(
        `Cannot delete file: URL ${filename} does not match bucket prefix.`,
      );
      // Có thể throw lỗi hoặc bỏ qua tùy logic
      return;
    }
    const gcsFilename = filename.substring(prefix.length);

    const file: File = this.bucket.file(gcsFilename);

    try {
      await file.delete();
      this.logger.log(`File ${gcsFilename} deleted successfully from GCS.`);
    } catch (error) {
      // Mã lỗi 404 nghĩa là file không tồn tại, có thể bỏ qua lỗi này
      if (error.code === 404) {
        this.logger.warn(
          `File ${gcsFilename} not found in GCS for deletion, skipping.`,
        );
        return;
      }
      this.logger.error(
        `Failed to delete file ${gcsFilename} from GCS: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to delete file from GCS: ${error.message}`,
      );
    }
  }

  /**
   * (Tùy chọn) Generates a signed URL for accessing a private file.
   * @param filename The full path of the file within the bucket.
   * @param durationMinutes The duration in minutes for which the URL is valid (default: 15).
   * @returns The signed URL.
   */
  async getSignedUrl(
    filename: string,
    durationMinutes: number = 15,
  ): Promise<string> {
    const options = {
      version: 'v4' as const, // Hoặc 'v2'
      action: 'read' as const,
      expires: Date.now() + durationMinutes * 60 * 1000, // duration phút
    };

    try {
      const [url] = await this.bucket.file(filename).getSignedUrl(options);
      this.logger.log(`Generated signed URL for ${filename}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for ${filename}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not generate signed URL.');
    }
  }
}
