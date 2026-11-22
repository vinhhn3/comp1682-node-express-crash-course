const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../errors/AppError');
const userRepository = require('../repositories/userRepository');
const config = require('../config');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const sameHash = (a, b) => {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

function tokensFor(user) {
  const payload = { id: user.id, username: user.username, role: user.role };

  return {
    accessToken: jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.accessSecret, {
      expiresIn: config.accessTtl,
    }),
    refreshToken: jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.refreshSecret, {
      expiresIn: config.refreshTtl,
    }),
    user: payload,
  };
}

exports.register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const existing = await userRepository.findByUsername(username);
  if (existing) {
    throw new AppError('Username already taken', 409);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ username, password: hash });

  res.status(201).json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await userRepository.findByUsernameWithPassword(username);
  const passwordMatches = user && (await bcrypt.compare(password, user.password));

  if (!passwordMatches) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokens = tokensFor(user);
  await userRepository.setRefreshTokenHash(user.id, sha256(tokens.refreshToken));

  res.json(tokens);
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.refreshSecret);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await userRepository.findByIdWithRefreshToken(payload.id);
  if (!user || !sameHash(user.refreshTokenHash, sha256(refreshToken))) {
    throw new AppError('Refresh token is no longer valid', 401);
  }

  const tokens = tokensFor(user);
  await userRepository.setRefreshTokenHash(user.id, sha256(tokens.refreshToken));

  res.json(tokens);
});

exports.logout = asyncHandler(async (req, res) => {
  await userRepository.clearRefreshToken(req.user.id);
  res.status(204).end();
});
