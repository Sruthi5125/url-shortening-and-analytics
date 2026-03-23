const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const urlService = require("../services/urlService");

// GET /api/public/:shortCode/stats
// Publicly accessible route to get safe stats for a short link
router.get("/:shortCode/stats", async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await urlService.findByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Determine if the link is still active based on expiration
    const isActive = !url.expiresAt || new Date() < new Date(url.expiresAt);

    // Last 7 days clicks
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysClicks = await prisma.visit.count({
      where: { urlId: url.id, visitedAt: { gte: sevenDaysAgo } }
    });

    // Last visited time
    const lastVisit = await prisma.visit.findFirst({
      where: { urlId: url.id },
      orderBy: { visitedAt: 'desc' },
      select: { visitedAt: true },
    });

    // Device & browser breakdown (aggregated, no PII)
    const allVisits = await prisma.visit.findMany({
      where: { urlId: url.id },
      select: { browser: true, deviceType: true },
    });

    const browserCounts = {};
    const deviceCounts = {};
    allVisits.forEach((v) => {
      const b = v.browser || 'Unknown';
      const d = v.deviceType || 'Desktop';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });

    const browserBreakdown = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Daily clicks for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicksRaw = await prisma.$queryRaw`
      SELECT DATE("visited_at") as date, CAST(COUNT(*) AS INTEGER) as count
      FROM "visits"
      WHERE "url_id" = ${url.id} AND "visited_at" >= ${thirtyDaysAgo}
      GROUP BY DATE("visited_at")
      ORDER BY DATE("visited_at") ASC
    `;

    const dailyClicks = dailyClicksRaw.map(row => ({
      date: new Date(row.date).toISOString().split('T')[0],
      count: row.count,
    }));

    res.status(200).json({
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      last7DaysClicks,
      isActive,
      lastVisitedAt: lastVisit?.visitedAt || null,
      browserBreakdown,
      deviceBreakdown,
      dailyClicks,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
