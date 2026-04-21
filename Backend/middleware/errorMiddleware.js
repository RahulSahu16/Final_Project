import { sendError } from "../utils/apiResponse.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return sendError(res, message, statusCode);
};
