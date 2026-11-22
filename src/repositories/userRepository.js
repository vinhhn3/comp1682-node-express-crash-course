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
}

module.exports = new UserRepository();
