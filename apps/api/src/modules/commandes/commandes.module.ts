import { Module } from '@nestjs/common';
import { CommandesService } from './commandes.service';
import { CommandesController } from './commandes.controller';
import { ConfigEngineModule } from '../config-engine/config-engine.module';

@Module({
  imports: [ConfigEngineModule],
  providers: [CommandesService],
  controllers: [CommandesController],
  exports: [CommandesService],
})
export class CommandesModule {}
