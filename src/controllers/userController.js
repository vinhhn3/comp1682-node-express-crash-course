const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../errors/AppError');
const userRepository = require('../repositories/userRepository');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';

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

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });

  res.json({ accessToken, user: payload });
});
