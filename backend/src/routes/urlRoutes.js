

const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createUrlSchema, updateUrlSchema } = require("../validators/urlValidators");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Apply protect to every route in this file
router.use(protect);

// POST /api/urls
// Create a new shortened URL for the logged-in user.
router.post("/", validate(createUrlSchema), urlController.createUrl);

// POST /api/urls/bulk
// Create multiple short URLs from a CSV file
router.post("/bulk", upload.single("csvFile"), urlController.bulkCreateUrl);

// GET /api/urls
// Fetch all URLs belonging to the logged-in user.
router.get("/", urlController.getUserUrls);

// PATCH /api/urls/:id
// Update a URL — only if it belongs to the logged-in user
router.patch("/:id", validate(updateUrlSchema), urlController.updateUrl);

// DELETE /api/urls/:id
// Delete a URL — but only if it belongs to the logged-in user (authorization check in controller).
router.delete("/:id", urlController.deleteUrl);

// GET /api/urls/:id/qrcode
// Generate a base64 QR code for a specific short URL
router.get("/:id/qrcode", urlController.getQrCode);

// GET /api/urls/:id/analytics
// Get click count + recent visit history for one URL.
router.get("/:id/analytics", urlController.getAnalytics);

module.exports = router;
