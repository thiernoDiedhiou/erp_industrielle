import { ConfigService } from '@nestjs/config';
import { EmailMessage } from './queue.service';
export declare class EmailService {
    private config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    envoyerEmail(message: EmailMessage): Promise<void>;
    private rendreCoprs;
}
