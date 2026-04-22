import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const SuperAdminJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class SuperAdminJwtStrategy extends SuperAdminJwtStrategy_base {
    private config;
    constructor(config: ConfigService);
    validate(payload: any): {
        id: any;
        email: any;
        nom: any;
    };
}
export {};
