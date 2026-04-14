import express from "express";
import cors from "cors";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
} from "../controllers/PropertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Preflight
router.options("/", cors());

// ✅ IMPORTANT: specific routes first
router.get("/properties", getAllProperties);
router.post("/properties",protect, upload.array("images"), createProperty);

// Dynamic routes after
router.get("/:id", getPropertyById);
router.delete("/:id", protect, deleteProperty);
router.put("/:id", protect, upload.array("images", 10), updateProperty);

export default router;