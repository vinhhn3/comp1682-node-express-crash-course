const productRepository = require('../repositories/productRepository');

exports.getAll = async (req, res) => {
  const products = await productRepository.findAll(req.query);
  res.set('X-Total-Count', String(products.length));
  res.json(products);
};

exports.getById = async (req, res) => {
  const product = await productRepository.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
};

exports.create = async (req, res) => {
  const { title, category, price } = req.body;

  if (!title || !category || typeof price !== 'number') {
    return res.status(400).json({
      error: 'title, category and a numeric price are required',
    });
  }

  const product = await productRepository.create({
    title,
    category,
    price,
    description: req.body.description,
    stock: req.body.stock,
  });

  res.status(201).json(product);
};
