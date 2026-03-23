const { z } = require("zod");

const createUrlSchema = z.object({
  originalUrl: z
    .string({ required_error: "Original URL is required" })
    .trim()
    .url("Please provide a valid URL (include http:// or https://)"),

  customAlias: z
    .string()
    .trim()
    .min(3, "Custom alias must be at least 3 characters")
    .max(30, "Custom alias must be 30 characters or less")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Custom alias can only contain letters, numbers, hyphens, and underscores"
    )
    .optional(),

  expiresAt: z.coerce
    .date()
    .min(new Date(), "Expiry date must be in the future")
    .optional(),
});

const updateUrlSchema = z.object({
  originalUrl: z
    .string({ required_error: "Original URL is required" })
    .trim()
    .url("Please provide a valid URL (include http:// or https://)"),
});

module.exports = { createUrlSchema, updateUrlSchema };
