import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { BomModule } from '../bom/bom.module';
import { ConfigEngineModule } from '../config-engine/config-engine.module';

@Module({
  imports: [BomModule, ConfigEngineModule],
  providers: [ProductionService],
  controllers: [ProductionController],
  exports: [ProductionService],
})
export class ProductionModule {}
