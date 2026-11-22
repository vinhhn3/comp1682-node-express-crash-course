const express = require('express');

const app = express();

app.use(express.json());

const products = [
  { id: 1, title: 'Aero Mug', category: 'Kitchen', price: 24, description: 'A thin-walled mug that keeps coffee warm for an hour.', stock: 40 },
  { id: 2, title: 'Halo Headphones', category: 'Audio', price: 89, description: 'Closed-back headphones with a detachable cable.', stock: 12 },
  { id: 3, title: 'Fern Pot', category: 'Home', price: 32, description: 'Glazed stoneware pot with a drainage tray.', stock: 25 },
  { id: 4, title: 'Slate Keyboard', category: 'Desk', price: 129, description: 'Tenkeyless mechanical keyboard, quiet switches.', stock: 8 },
  { id: 5, title: 'Ember Candle', category: 'Home', price: 18, description: 'Soy candle, cedar and smoke, 40 hour burn.', stock: 60 },
  { id: 6, title: 'Field Backpack', category: 'Travel', price: 74, description: 'Waxed canvas, 22 litres, laptop sleeve.', stock: 15 },
];

let nextId = 7;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find((p) => String(p.id) === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.post('/products', (req, res) => {
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
