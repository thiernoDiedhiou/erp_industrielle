import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '@saas-erp/shared';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
