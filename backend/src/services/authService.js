const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// Helper: generate a signed JWT containing the user's id
const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};


const signup = async ({ name, email, password }) => {
  // 1. Check if email is already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email already in use");
    error.statusCode = 409; // Conflict
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Create the user in DB
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // 4. Issue a JWT
  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
};


const login = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Use the same error message whether email is wrong or password is wrong.
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 3. Compare entered password against stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 4. Issue JWT
  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
};

module.exports = { signup, login, getUserById };

