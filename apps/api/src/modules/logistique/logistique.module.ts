import { Module } from '@nestjs/common';
import { LogistiqueService } from './logistique.service';
import { LogistiqueController } from './logistique.controller';

@Module({
  providers: [LogistiqueService],
  controllers: [LogistiqueController],
  exports: [LogistiqueService],
})
export class LogistiqueModule {}
