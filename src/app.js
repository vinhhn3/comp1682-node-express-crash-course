const config = require('./config');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const AppError = require('./errors/AppError');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { globalLimiter } = require('./middlewares/rateLimitMiddleware');
const specs = require('./docs/swagger');

const app = express();

app.use(globalLimiter);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { customSiteTitle: 'Shop API' }));
app.get('/api-docs.json', (req, res) => res.json(specs));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
