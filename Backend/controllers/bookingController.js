import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as bookingService from "../services/bookingService.js";

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user._id);
  return sendSuccess(res, "Booking created successfully", { booking }, 201);
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await bookingService.createPaymentOrder(req.body, req.user._id);
  return sendSuccess(res, "Payment order created successfully", { order }, 201);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const booking = await bookingService.verifyPayment(req.body, req.user._id);
  return sendSuccess(res, "Payment verified successfully", { booking });
});