import { Module } from '@nestjs/common';
import { MatieresPremiereService } from './matieres-premieres.service';
import { MatieresPremiereController } from './matieres-premieres.controller';

@Module({
  providers: [MatieresPremiereService],
  controllers: [MatieresPremiereController],
  exports: [MatieresPremiereService],
})
export class MatieresPremiereModule {}
