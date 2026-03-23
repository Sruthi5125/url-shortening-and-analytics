const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { signupSchema, loginSchema } = require("../validators/authValidators");


router.post("/signup", validate(signupSchema), authController.signup);

router.post("/login", validate(loginSchema), authController.login);

router.get("/me", protect, authController.getMe);

module.exports = router;
