const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const protect = (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" → "<token>"

  try {
    // 2. Verify the token using our secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Attach payload to request so controllers can use req.user.id
    req.user = decoded; // { id, iat, exp }

    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

module.exports = { protect };
