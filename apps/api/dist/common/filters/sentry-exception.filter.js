"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SentryExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const Sentry = require("@sentry/node");
let SentryExceptionFilter = SentryExceptionFilter_1 = class SentryExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(SentryExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const statut = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : 'Erreur interne du serveur';
        if (statut >= 500) {
            Sentry.withScope((scope) => {
                scope.setTag('url', request.url);
                scope.setTag('method', request.method);
                scope.setExtra('body', request.body);
                scope.setExtra('params', request.params);
                scope.setExtra('query', request.query);
                const user = request.user;
                if (user) {
                    scope.setUser({
                        id: user.sub,
                        email: user.email,
                        extra: { tenantId: user.tenantId, role: user.role },
                    });
                }
                Sentry.captureException(exception);
            });
            this.logger.error(`[${request.method}] ${request.url} → ${statut}`, exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(statut).json({
            statusCode: statut,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
};
exports.SentryExceptionFilter = SentryExceptionFilter;
exports.SentryExceptionFilter = SentryExceptionFilter = SentryExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], SentryExceptionFilter);
//# sourceMappingURL=sentry-exception.filter.js.map