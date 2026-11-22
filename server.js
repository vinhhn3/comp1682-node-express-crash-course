require('dotenv').config();

const express = require('express');
const connectToDatabase = require('./src/config/database');
const productRoutes = require('./src/routes/productRoutes');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = 8000;

async function start() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start();
