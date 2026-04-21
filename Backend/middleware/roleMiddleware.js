import AppError from "../utils/appError.js";

export const authorize = (...allowedRoles) => (req, _res, next) => {
  const userRoles = req.user?.roles || [];
  const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

  if (!isAllowed) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }

  next();
};
