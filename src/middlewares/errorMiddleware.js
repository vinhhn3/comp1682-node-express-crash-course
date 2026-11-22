const AppError = require('../errors/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ') || 'field'}`;
  }

  if (status >= 500 && !err.isOperational) message = 'Something went wrong';
  if (status >= 500) console.error(err);

  if (res.headersSent) return next(err);

  res.status(status).json({
    error: {
      message,
      status,
      ...(details?.length ? { details } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };
