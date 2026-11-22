const express = require('express');
const productRoutes = require('./src/routes/productRoutes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
