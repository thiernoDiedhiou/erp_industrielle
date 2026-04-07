import { Module } from '@nestjs/common';
import { RecyclageService } from './recyclage.service';
import { RecyclageController } from './recyclage.controller';

@Module({
  providers: [RecyclageService],
  controllers: [RecyclageController],
})
export class RecyclageModule {}
