import express from "express";
import { createBooking, createPaymentOrder, verifyPayment } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createBookingSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from "../validations/bookingValidation.js";

const router = express.Router();

router.post("/", protect, validateRequest(createBookingSchema), createBooking);
router.post("/payment/order", protect, validateRequest(createPaymentOrderSchema), createPaymentOrder);
router.post("/payment/verify", protect, validateRequest(verifyPaymentSchema), verifyPayment);

export default router;