import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
