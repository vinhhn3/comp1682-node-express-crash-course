require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./src/config/database');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');
const { globalLimiter } = require('./src/middlewares/rateLimitMiddleware');
const AppError = require('./src/errors/AppError');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(globalLimiter);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new AppError(`Origin ${origin} is not allowed`, 403));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 24 * 60 * 60,
  }),
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/products', productRoutes);
app.use('/users', userRoutes);

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
