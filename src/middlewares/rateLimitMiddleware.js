const rateLimit = require('express-rate-limit');
const config = require('../config/rateLimitConfig');

const globalLimiter = rateLimit(config.global);
const loginLimiter = rateLimit(config.login);

module.exports = { globalLimiter, loginLimiter };
