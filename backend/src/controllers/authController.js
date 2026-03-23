const authService = require("../services/authService");

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = await authService.signup({ name, email, password });

    res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login({ email, password });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware after verifying the JWT
    const user = await authService.getUserById(req.user.id);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe };
