import Joi from 'joi';

const validateRequest = (schema) => (req, _res, next) => {
  if (!schema) return next();

  const segments = ['body', 'params', 'query'];
  const validationResult = segments.reduce(
    (acc, segment) => {
      if (!schema[segment]) return acc;

      const { error, value } = schema[segment].validate(req[segment], {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        acc.errors.push(...error.details.map((detail) => detail.message));
      } else {
        acc.values[segment] = value;
      }

      return acc;
    },
    { errors: [], values: { body: req.body, params: req.params, query: req.query } }
  );

  if (validationResult.errors.length > 0) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = validationResult.errors;
    return next(err);
  }

  Object.assign(req, validationResult.values);
  return next();
};

export default validateRequest;
