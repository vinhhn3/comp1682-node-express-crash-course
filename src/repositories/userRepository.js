const User = require('../models/user');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByUsername(username) {
    return User.findOne({ username });
  }

  async findByUsernameWithPassword(username) {
    return User.findOne({ username }).select('+password');
  }

  async findByIdWithRefreshToken(id) {
    return User.findById(id).select('+refreshTokenHash');
  }

  async setRefreshTokenHash(id, hash) {
    return User.findByIdAndUpdate(id, { refreshTokenHash: hash });
  }

  async clearRefreshToken(id) {
    return User.findByIdAndUpdate(id, { $unset: { refreshTokenHash: 1 } });
  }
}

module.exports = new UserRepository();
