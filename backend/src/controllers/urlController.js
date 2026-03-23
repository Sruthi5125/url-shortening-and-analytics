const qrcode = require("qrcode");
const urlService = require("../services/urlService");
const analyticsService = require("../services/analyticsService");

// POST /api/urls
// Create a new shortened URL
const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id;

    const url = await urlService.createUrl({ originalUrl, customAlias, userId, expiresAt });

    res.status(201).json({
      message: "Short URL created",
      url,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/urls
// Get all URLs created by the logged-in user
const getUserUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const urls = await urlService.getUrlsByUser(userId);

    res.status(200).json({ urls });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/urls/:id
// Delete a URL — only if it belongs to the logged-in user
const deleteUrl = async (req, res, next) => {
  try {
    const urlId = parseInt(req.params.id);
    const userId = req.user.id;

    // The service checks ownership and throws if mismatch
    await urlService.deleteUrl({ urlId, userId });

    res.status(200).json({ message: "URL deleted" });
  } catch (error) {
    next(error);
  }
};

// GET /api/urls/:id/analytics
// Get analytics for a specific URL (must belong to logged-in user)
const getAnalytics = async (req, res, next) => {
  try {
    const urlId = parseInt(req.params.id);
    const userId = req.user.id;

    const analytics = await analyticsService.getAnalyticsForUrl({ urlId, userId });

    res.status(200).json({ analytics });
  } catch (error) {
    next(error);
  }
};

// GET /api/urls/:id/qrcode
// Get QR code for a specific URL (must belong to logged-in user)
const getQrCode = async (req, res, next) => {
  try {
    const urlId = parseInt(req.params.id);
    const userId = req.user.id;

    const url = await urlService.getUrlById({ urlId, userId });
    const qrCodeImage = await qrcode.toDataURL(url.shortUrl);

    res.status(200).json({ qrCode: qrCodeImage });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/urls/:id
// Update a specific URL
const updateUrl = async (req, res, next) => {
  try {
    const urlId = parseInt(req.params.id);
    const userId = req.user.id;
    const { originalUrl } = req.body;

    const url = await urlService.updateUrl({ urlId, userId, originalUrl });

    res.status(200).json({ 
      message: "URL updated successfully",
      url,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/urls/bulk
// Create URLs from CSV
const bulkCreateUrl = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a CSV file" });
    }

    const userId = req.user.id;
    const fileBuffer = req.file.buffer;

    const result = await urlService.bulkCreateUrl({ fileBuffer, userId });

    res.status(201).json({
      message: `Processed ${result.totalProcessed} rows`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUrl, getUserUrls, deleteUrl, getAnalytics, getQrCode, updateUrl, bulkCreateUrl };
