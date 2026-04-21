import express from "express";
import { register, login, becomeHost } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/signup", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.patch("/become-host", protect, becomeHost);

export default router;