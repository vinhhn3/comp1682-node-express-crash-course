const config = require('./index');

const shared = {
  windowMs: 60 * 1000,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test',
};

module.exports = {
  global: {
    ...shared,
    max: 100,
    message: {
      error: { message: 'Too many requests, slow down', status: 429 },
    },
  },

  login: {
    ...shared,
    max: 5,
    message: {
      error: { message: 'Too many login attempts, try again in a minute', status: 429 },
    },
  },
};
