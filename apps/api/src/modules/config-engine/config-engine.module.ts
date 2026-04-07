import { Module } from '@nestjs/common';
import { ConfigEngineService } from './config-engine.service';
import { ConfigEngineController } from './config-engine.controller';

@Module({
  providers: [ConfigEngineService],
  controllers: [ConfigEngineController],
  exports: [ConfigEngineService],
})
export class ConfigEngineModule {}
