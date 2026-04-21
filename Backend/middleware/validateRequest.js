import AppError from "../utils/appError.js";

const validateRequest = (schema, source = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return next(new AppError(message, 400));
  }

  req[source] = value;
  next();
};

export default validateRequest;
