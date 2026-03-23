// src/services/analyticsService.js
// Handles recording visits and querying analytics data.
//
// Design decision (from the PDF):
//   - Store click_count on the URL row  → fast summary number
//   - Store individual rows in visits   → rich history, future queries

const prisma = require("../config/db");

// ------------------------------------------------------------------
// recordVisit
// Called every time someone clicks a short link.
// Runs two DB operations inside a transaction so they succeed or fail together.
// ------------------------------------------------------------------
const recordVisit = async ({ urlId, ipAddress, userAgent, referer, browser, os, deviceType }) => {
  await prisma.$transaction([
    // 1. Increment the fast click counter on the URL
    prisma.url.update({
      where: { id: urlId },
      data: { clickCount: { increment: 1 } },
    }),

    // 2. Insert a detailed visit row for history and future analytics
    prisma.visit.create({
      data: {
        urlId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        referer: referer || null,
        browser: browser || null,
        os: os || null,
        deviceType: deviceType || null,
      },
    }),
  ]);
};

// ------------------------------------------------------------------
// getAnalyticsForUrl
// Returns summary + recent visits for the analytics page.
// Checks ownership so users can't spy on other users' URLs.
// ------------------------------------------------------------------
const getAnalyticsForUrl = async ({ urlId, userId }) => {
  const url = await prisma.url.findUnique({ where: { id: urlId } });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  if (url.userId !== userId) {
    const error = new Error("You do not have permission to view this URL's analytics");
    error.statusCode = 403;
    throw error;
  }

  // Fetch the 10 most recent visits
  const recentVisits = await prisma.visit.findMany({
    where: { urlId },
    orderBy: { visitedAt: "desc" },
    take: 10,
  });

  // Calculate browser and device breakdown
  const allVisitsForStats = await prisma.visit.findMany({
    where: { urlId },
    select: { browser: true, deviceType: true },
  });

  const browserCounts = {};
  const deviceCounts = {};

  allVisitsForStats.forEach((v) => {
    const b = v.browser || "Unknown";
    const d = v.deviceType || "Desktop"; // Default to Desktop if missing but UA exists, or just Unknown. Let's use Unknown for safety if null. Actually ua-parser sets device.type to undefined for desktop.
    browserCounts[b] = (browserCounts[b] || 0) + 1;
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
  });

  const browserBreakdown = Object.entries(browserCounts).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count);
  const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count);

  // Daily clicks for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyClicksRaw = await prisma.$queryRaw`
    SELECT DATE("visited_at") as date, CAST(COUNT(*) AS INTEGER) as count
    FROM "visits"
    WHERE "url_id" = ${urlId} AND "visited_at" >= ${thirtyDaysAgo}
    GROUP BY DATE("visited_at")
    ORDER BY DATE("visited_at") ASC
  `;

  const dailyClicks = dailyClicksRaw.map(row => ({
    date: new Date(row.date).toISOString().split('T')[0],
    count: row.count
  }));

  return {
    totalClicks: url.clickCount,
    lastVisitedAt: recentVisits[0]?.visitedAt || null,
    recentVisits,
    expiresAt: url.expiresAt,
    browserBreakdown,
    deviceBreakdown,
    dailyClicks,
  };
};

module.exports = { recordVisit, getAnalyticsForUrl };
