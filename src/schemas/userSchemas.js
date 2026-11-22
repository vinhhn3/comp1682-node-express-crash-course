const { z } = require('zod');

const username = z
  .string({ error: 'username is required' })
  .trim()
  .min(3, 'username must be at least 3 characters')
  .max(30, 'username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'username may only contain letters, numbers and _');

const password = z
  .string({ error: 'password is required' })
  .min(8, 'password must be at least 8 characters')
  .max(72, 'password must be at most 72 characters');

const registerSchema = z.object({ username, password });

module.exports = { registerSchema };
