const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../errors/AppError');
const productRepository = require('../repositories/productRepository');

exports.getAll = asyncHandler(async (req, res) => {
  const products = await productRepository.findAll(req.query);
  res.set('X-Total-Count', String(products.length));
  res.json(products);
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productRepository.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json(product);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productRepository.create(req.body);
  res.status(201).json(product);
});
