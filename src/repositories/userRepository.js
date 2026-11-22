const User = require('../models/user');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByUsername(username) {
    return User.findOne({ username });
  }
}

module.exports = new UserRepository();
