
const express = require("express");
const router = express.Router();

const redirectController = require("../controllers/redirectController");

// GET /r/:shortCode
router.get("/:shortCode", redirectController.handleRedirect);

module.exports = router;
