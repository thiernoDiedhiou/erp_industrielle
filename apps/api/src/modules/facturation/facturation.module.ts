import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';
import { PdfService } from './pdf.service';

@Module({
  providers: [FacturationService, PdfService],
  controllers: [FacturationController],
  exports: [FacturationService],
})
export class FacturationModule {}
