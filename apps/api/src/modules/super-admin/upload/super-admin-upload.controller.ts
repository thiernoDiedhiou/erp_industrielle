import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminJwtAuthGuard } from '../guards/super-admin-jwt-auth.guard';
import { MinioService } from '../../upload/minio.service';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo

@ApiTags('Super-Admin Upload')
@ApiBearerAuth()
@UseGuards(SuperAdminJwtAuthGuard)
@Controller('super-admin/upload')
export class SuperAdminUploadController {
  constructor(private minio: MinioService) {}

  @Post('logo')
  @ApiOperation({ summary: 'Upload du logo d\'un tenant (max 2 Mo, PNG/JPG/WEBP/SVG)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (ACCEPTED_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.'), false);
      }
    },
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const url = await this.minio.uploadLogo(file.buffer, file.originalname, file.mimetype);
    return { url };
  }
}
