"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWinstonConfig = buildWinstonConfig;
const winston = require("winston");
const { combine, timestamp, json, colorize, printf, errors } = winston.format;
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), printf(({ timestamp, level, message, context, trace, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stack = trace ? `\n${trace}` : '';
    return `${timestamp} ${level}${ctx}: ${message}${extra}${stack}`;
}));
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
function buildWinstonConfig() {
    const estProduction = process.env.NODE_ENV === 'production';
    return {
        transports: [
            new winston.transports.Console({
                format: estProduction ? prodFormat : devFormat,
                level: estProduction ? 'warn' : 'debug',
            }),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: combine(timestamp(), errors({ stack: true }), json()),
                maxsize: 10 * 1024 * 1024,
                maxFiles: 5,
            }),
            new winston.transports.File({
                filename: 'logs/combined.log',
                format: combine(timestamp(), errors({ stack: true }), json()),
                maxsize: 50 * 1024 * 1024,
                maxFiles: 7,
            }),
        ],
        defaultMeta: {
            service: 'erp-api',
            env: process.env.NODE_ENV || 'development',
        },
    };
}
//# sourceMappingURL=winston.config.js.map