require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT || 8000);
const cacheTtlSeconds = Number(process.env.CACHE_TTL || 60);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer');
}

if (!Number.isFinite(cacheTtlSeconds) || cacheTtlSeconds < 0) {
  throw new Error('CACHE_TTL must be zero or more seconds');
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';

if (
  nodeEnv === 'production' &&
  (accessSecret.startsWith('dev-') || refreshSecret.startsWith('dev-'))
) {
  throw new Error('Set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET before running in production');
}

module.exports = {
  nodeEnv,
  port,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop',
  accessSecret,
  refreshSecret,
  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  cacheTtlSeconds,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
