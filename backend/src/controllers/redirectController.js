// src/controllers/redirectController.js
// Handles the core redirect flow:
//   1. Look up the short code in the DB
//   2. Check if the link is expired
//   3. Record the visit (analytics)
//   4. Send an HTTP 302 redirect to the original URL
//
// This is a PUBLIC route — no JWT needed.
// The redirect MUST happen on the server (not in React).

const urlService = require("../services/urlService");
const analyticsService = require("../services/analyticsService");
const { UAParser } = require("ua-parser-js");

// GET /r/:shortCode
const handleRedirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Step 1: Find the URL record by short code
    const url = await urlService.findByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Step 2: Check if the link has expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).json({ error: "This link has expired" });
    }

    // Step 3: Parse User-Agent for device analytics
    const userAgentStr = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgentStr);
    const browser = parser.getBrowser().name || null;
    const os = parser.getOS().name || null;
    const deviceType = parser.getDevice().type || (userAgentStr ? "Desktop" : null);

    // Step 4: Record the visit asynchronously
    // We fire-and-forget here — we don't await so the user isn't slowed down
    analyticsService
      .recordVisit({
        urlId: url.id,
        ipAddress: req.ip,
        userAgent: userAgentStr || null,
        referer: req.headers["referer"] || null,
        browser,
        os,
        deviceType,
      })
      .catch((err) => console.error("Analytics recording failed:", err));

    // Step 5: HTTP 302 redirect to the original URL
    res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { handleRedirect };
