import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET_LOGOS') || 'logos';
    this.client = new Minio.Client({
      endPoint:  this.config.get<string>('MINIO_ENDPOINT')  || 'localhost',
      port:      parseInt(this.config.get<string>('MINIO_PORT') || '9000'),
      useSSL:    this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY') || 'minio_admin',
      secretKey: this.config.get<string>('MINIO_SECRET_KEY') || 'minio_secret',
    });
  }

  async onModuleInit() {
    try {
      const existe = await this.client.bucketExists(this.bucket);
      if (!existe) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        // Politique lecture publique pour les logos
        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          }],
        });
        await this.client.setBucketPolicy(this.bucket, policy);
        this.logger.log(`Bucket "${this.bucket}" créé avec politique publique`);
      }
    } catch (err) {
      this.logger.warn(`MinIO non disponible : ${(err as Error).message}`);
    }
  }

  async uploadLogo(buffer: Buffer, originalname: string, mimetype: string): Promise<string> {
    const ext = originalname.split('.').pop()?.toLowerCase() || 'png';
    const filename = `logo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await this.client.putObject(this.bucket, filename, buffer, buffer.length, {
      'Content-Type': mimetype,
    });

    const endpoint  = this.config.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port      = this.config.get<string>('MINIO_PORT')     || '9000';
    const useSSL    = this.config.get<string>('MINIO_USE_SSL')  === 'true';
    const protocol  = useSSL ? 'https' : 'http';

    return `${protocol}://${endpoint}:${port}/${this.bucket}/${filename}`;
  }
}
