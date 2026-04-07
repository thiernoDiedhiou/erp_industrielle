"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const Sentry = require("@sentry/node");
const profiling_node_1 = require("@sentry/profiling-node");
const app_module_1 = require("./app.module");
const winston_config_1 = require("./common/logger/winston.config");
const sentry_exception_filter_1 = require("./common/filters/sentry-exception.filter");
async function bootstrap() {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
            tracesSampleRate: 0.2,
            profilesSampleRate: 1.0,
        });
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger((0, winston_config_1.buildWinstonConfig)()),
    });
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalFilters(new sentry_exception_filter_1.SentryExceptionFilter());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('SaaS ERP API')
        .setDescription('API plateforme ERP industrielle multi-tenant')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    logger.log(`API démarrée sur http://localhost:${port}/api/v1`, 'Bootstrap');
    logger.log(`Swagger sur http://localhost:${port}/api/docs`, 'Bootstrap');
    if (process.env.SENTRY_DSN) {
        logger.log('Sentry activé', 'Bootstrap');
    }
}
bootstrap();
//# sourceMappingURL=main.js.map