// Single place to read and validate environment variables.
// If a required variable is missing, we crash early with a clear message
// instead of getting a confusing error deep in the code later.

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
