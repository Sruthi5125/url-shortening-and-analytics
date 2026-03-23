const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Zod's flatten() gives a clean { fieldErrors, formErrors } structure
    const errors = result.error.flatten().fieldErrors;
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Replace req.body with the parsed (and potentially coerced) data
  req.body = result.data;
  next();
};

module.exports = validate;
