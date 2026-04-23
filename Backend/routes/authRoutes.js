import express from "express";
import { sendOtp, verifyOtp, register, googleAuth, login, becomeHost } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  googleAuthSchema,
  loginSchema,
} from "../validations/authValidation.js";

const router = express.Router();

router.post("/send-otp", validateRequest(sendOtpSchema), sendOtp);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtp);
router.post("/register", validateRequest(registerSchema), register);
router.post("/signup", validateRequest(registerSchema), register);
router.post("/google", validateRequest(googleAuthSchema), googleAuth);
router.post("/login", validateRequest(loginSchema), login);
router.patch("/become-host", protect, becomeHost);

export default router;
