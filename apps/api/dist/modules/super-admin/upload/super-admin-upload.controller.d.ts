import { MinioService } from '../../upload/minio.service';
export declare class SuperAdminUploadController {
    private minio;
    constructor(minio: MinioService);
    uploadLogo(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
