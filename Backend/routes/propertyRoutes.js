import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
  searchProperties,
} from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";
import validateRequest from "../middleware/validateRequest.js";
import { createPropertySchema } from "../validations/propertyValidation.js";

const router = express.Router();

router.get("/properties", getAllProperties);
router.get("/properties/search", searchProperties);
router.get("/properties/:id", getPropertyById);
router.post(
  "/properties",
  protect,
  authorize("host"),
  upload.array("images", 10),
  validateRequest(createPropertySchema),
  createProperty
);
router.put(
  "/properties/:id",
  protect,
  authorize("host"),
  upload.array("images", 10),
  validateRequest(createPropertySchema),
  updateProperty
);
router.delete("/properties/:id", protect, authorize("host"), deleteProperty);

export default router;