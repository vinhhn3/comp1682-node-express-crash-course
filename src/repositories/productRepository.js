const Product = require('../models/product');

class ProductRepository {
  async findAll({ q, category } = {}) {
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;

    return Product.find(filter).sort({ createdAt: 1, _id: 1 });
  }

  async findById(id) {
    return Product.findById(id);
  }

  async create(data) {
    return Product.create(data);
  }

  async updateById(id, data) {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();
