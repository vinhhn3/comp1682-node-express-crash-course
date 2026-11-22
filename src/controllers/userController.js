const bcrypt = require('bcrypt');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../errors/AppError');
const userRepository = require('../repositories/userRepository');

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
