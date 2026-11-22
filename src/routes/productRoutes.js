const express = require('express');

const router = express.Router();

const products = [
  { id: 1, title: 'Aero Mug', category: 'Kitchen', price: 24, description: 'A thin-walled mug that keeps coffee warm for an hour.', stock: 40 },
  { id: 2, title: 'Halo Headphones', category: 'Audio', price: 89, description: 'Closed-back headphones with a detachable cable.', stock: 12 },
  { id: 3, title: 'Fern Pot', category: 'Home', price: 32, description: 'Glazed stoneware pot with a drainage tray.', stock: 25 },
  { id: 4, title: 'Slate Keyboard', category: 'Desk', price: 129, description: 'Tenkeyless mechanical keyboard, quiet switches.', stock: 8 },
  { id: 5, title: 'Ember Candle', category: 'Home', price: 18, description: 'Soy candle, cedar and smoke, 40 hour burn.', stock: 60 },
  { id: 6, title: 'Field Backpack', category: 'Travel', price: 74, description: 'Waxed canvas, 22 litres, laptop sleeve.', stock: 15 },
];

let nextId = 7;

router.get('/', (req, res) => {
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = products.find((p) => String(p.id) === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

router.post('/', (req, res) => {
  const { title, category, price } = req.body;

  if (!title || !category || typeof price !== 'number') {
    return res.status(400).json({
      error: 'title, category and a numeric price are required',
    });
  }

  const product = {
    id: nextId++,
    title,
    category,
    price,
    description: req.body.description ?? '',
    stock: req.body.stock ?? 0,
    createdAt: new Date().toISOString(),
  };

  products.push(product);
  res.status(201).json(product);
});

module.exports = router;
