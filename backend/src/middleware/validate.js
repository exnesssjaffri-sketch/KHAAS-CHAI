// Validation Middleware using Zod
export function validate(schema) {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!result.success) {
        const errors = result.error.flatten();
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: errors
        });
      }

      req.body = result.data.body || req.body;
      req.query = result.data.query || req.query;
      req.params = result.data.params || req.params;
      next();
    } catch (err) {
      next(err);
    }
  };
}