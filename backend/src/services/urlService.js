// src/services/urlService.js
// Business logic for URL creation, retrieval, and deletion.

const prisma = require("../config/db");
const generateShortCode = require("../utils/generateShortCode");
const { parse } = require("csv-parse/sync");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const createUrl = async ({ originalUrl, customAlias, userId, expiresAt }) => {
  let shortCode;

  if (customAlias) {
    // User provided a custom alias — check it's not taken
    const existing = await prisma.url.findUnique({
      where: { customAlias },
    });
    if (existing) {
      const error = new Error("Custom alias is already taken");
      error.statusCode = 409;
      throw error;
    }
    shortCode = customAlias;
  } else {
    // Auto-generate a unique short code (retry until unique)
    shortCode = await generateUniqueShortCode();
  }

  // Save to DB
  const url = await prisma.url.create({
    data: {
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: expiresAt || null,
    },
  });

  // Return the record with a convenience shortUrl field
  return {
    ...url,
    shortUrl: `${BASE_URL}/r/${url.shortCode}`,
  };
};

// Helper: keep generating until we get a code not already in the DB
const generateUniqueShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateShortCode();
    const found = await prisma.url.findUnique({ where: { shortCode: code } });
    exists = !!found;
  }

  return code;
};

const getUrlsByUser = async (userId) => {
  const urls = await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Attach shortUrl for frontend convenience
  return urls.map((url) => ({
    ...url,
    shortUrl: `${BASE_URL}/r/${url.shortCode}`,
  }));
};

const updateUrl = async ({ urlId, userId, originalUrl }) => {
  const url = await prisma.url.findUnique({ where: { id: urlId } });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  if (url.userId !== userId) {
    const error = new Error("You do not have permission to edit this URL");
    error.statusCode = 403;
    throw error;
  }

  const updatedUrl = await prisma.url.update({
    where: { id: urlId },
    data: { originalUrl },
  });

  return {
    ...updatedUrl,
    shortUrl: `${BASE_URL}/r/${updatedUrl.shortCode}`,
  };
};

const deleteUrl = async ({ urlId, userId }) => {
  const url = await prisma.url.findUnique({ where: { id: urlId } });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization: make sure the URL belongs to the requesting user
  if (url.userId !== userId) {
    const error = new Error("You do not have permission to delete this URL");
    error.statusCode = 403;
    throw error;
  }

  await prisma.url.delete({ where: { id: urlId } });
};


const getUrlById = async ({ urlId, userId }) => {
  const url = await prisma.url.findUnique({ where: { id: urlId } });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  if (url.userId !== userId) {
    const error = new Error("You do not have permission to view this URL");
    error.statusCode = 403;
    throw error;
  }

  return {
    ...url,
    shortUrl: `${BASE_URL}/r/${url.shortCode}`,
  };
};

const findByShortCode = async (shortCode) => {
  return prisma.url.findUnique({ where: { shortCode } });
};

const bulkCreateUrl = async ({ fileBuffer, userId }) => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const createdUrls = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const originalUrl = record.originalUrl || record.url || record.Destination;
      if (!originalUrl) throw new Error("Missing originalUrl column");

      const newUrl = await createUrl({
        originalUrl,
        customAlias: record.customAlias || record.alias || undefined,
        expiresAt: record.expiresAt || undefined,
        userId,
      });
      createdUrls.push(newUrl);
    } catch (err) {
      errors.push({ row: i + 1, error: err.message });
    }
  }

  return { createdUrls, errors, totalProcessed: records.length };
};

module.exports = { createUrl, getUrlsByUser, getUrlById, updateUrl, deleteUrl, findByShortCode, bulkCreateUrl };
