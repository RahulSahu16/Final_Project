import express from "express";
import multer from "multer";
import cors from "cors";
import { createProperty, getAllProperties, getPropertyById, deleteProperty, updateProperty } from "../controllers/PropertyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.options('/', cors()); // Handle preflight
router.get("/:id", getPropertyById);
router.delete("/:id", protect, deleteProperty);
router.put("/:id", protect, upload.array("images", 10), updateProperty);

export default router;