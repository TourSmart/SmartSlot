export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
};
