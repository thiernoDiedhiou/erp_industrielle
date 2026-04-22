import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private config;
    private readonly logger;
    private client;
    private bucket;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    uploadLogo(buffer: Buffer, originalname: string, mimetype: string): Promise<string>;
}
