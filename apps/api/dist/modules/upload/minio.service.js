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
var MinioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = require("minio");
let MinioService = MinioService_1 = class MinioService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(MinioService_1.name);
        this.bucket = this.config.get('MINIO_BUCKET_LOGOS') || 'logos';
        this.client = new Minio.Client({
            endPoint: this.config.get('MINIO_ENDPOINT') || 'localhost',
            port: parseInt(this.config.get('MINIO_PORT') || '9000'),
            useSSL: this.config.get('MINIO_USE_SSL') === 'true',
            accessKey: this.config.get('MINIO_ACCESS_KEY') || 'minio_admin',
            secretKey: this.config.get('MINIO_SECRET_KEY') || 'minio_secret',
        });
    }
    async onModuleInit() {
        try {
            const existe = await this.client.bucketExists(this.bucket);
            if (!existe) {
                await this.client.makeBucket(this.bucket, 'us-east-1');
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
        }
        catch (err) {
            this.logger.warn(`MinIO non disponible : ${err.message}`);
        }
    }
    async uploadLogo(buffer, originalname, mimetype) {
        const ext = originalname.split('.').pop()?.toLowerCase() || 'png';
        const filename = `logo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await this.client.putObject(this.bucket, filename, buffer, buffer.length, {
            'Content-Type': mimetype,
        });
        const endpoint = this.config.get('MINIO_ENDPOINT') || 'localhost';
        const port = this.config.get('MINIO_PORT') || '9000';
        const useSSL = this.config.get('MINIO_USE_SSL') === 'true';
        const protocol = useSSL ? 'https' : 'http';
        return `${protocol}://${endpoint}:${port}/${this.bucket}/${filename}`;
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = MinioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map