// server.js
// Entry point. Only responsibility: start the HTTP server.
// We keep this separate from app.js so app.js stays testable
// (you can import app without actually binding to a port).

require("dotenv").config(); // Load .env before anything else

const app = require("./src/app");
const { PORT } = require("./src/config/env");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
