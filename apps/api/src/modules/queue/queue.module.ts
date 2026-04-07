import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueConsumer } from './queue.consumer';
import { EmailService } from './email.service';

@Global() // QueueService injectable partout sans import explicite
@Module({
  providers: [QueueService, QueueConsumer, EmailService],
  exports: [QueueService, EmailService],
})
export class QueueModule {}
