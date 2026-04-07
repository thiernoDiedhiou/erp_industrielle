import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Format lisible pour le développement
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, context, trace, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stack = trace ? `\n${trace}` : '';
    return `${timestamp} ${level}${ctx}: ${message}${extra}${stack}`;
  }),
);

// Format JSON structuré pour la production (compatible Datadog, Loki, CloudWatch)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export function buildWinstonConfig(): WinstonModuleOptions {
  const estProduction = process.env.NODE_ENV === 'production';

  return {
    transports: [
      new winston.transports.Console({
        format: estProduction ? prodFormat : devFormat,
        // En prod : ne loguer que warn et plus
        level: estProduction ? 'warn' : 'debug',
      }),
      // Fichier d'erreurs persistant (toujours actif)
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5,
      }),
      // Fichier complet (toutes les traces)
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 50 * 1024 * 1024, // 50 MB
        maxFiles: 7,
      }),
    ],
    // Métadonnées globales présentes dans chaque log
    defaultMeta: {
      service: 'erp-api',
      env: process.env.NODE_ENV || 'development',
    },
  };
}
