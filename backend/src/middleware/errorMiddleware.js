const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);


  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500
      ? "Something went wrong on the server" // Hide internal details in production
      : err.message;

  res.status(statusCode).json({ message });
};

module.exports = errorMiddleware;
