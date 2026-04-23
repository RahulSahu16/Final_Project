import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
  registerUser,
  loginUser,
  becomeHost as becomeHostService,
} from "../services/authService.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const result = await sendOtpService(req.body);
  return sendSuccess(res, "OTP sent successfully", result);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await verifyOtpService(req.body);
  return sendSuccess(res, "OTP verified successfully", result);
});

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return sendSuccess(res, "User registered successfully", result, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  return sendSuccess(res, "Login successful", result);
});

export const becomeHost = asyncHandler(async (req, res) => {
  const user = await becomeHostService(req.user._id);
  return sendSuccess(res, "User role updated to host", { user });
});
