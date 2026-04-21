import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as propertyService from "../services/propertyService.js";

export const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user._id, req.files);
  return sendSuccess(res, "Property created successfully", { property }, 201);
});

export const getAllProperties = asyncHandler(async (_req, res) => {
  const properties = await propertyService.getAllProperties();
  return sendSuccess(res, "Properties fetched successfully", { properties });
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  return sendSuccess(res, "Property fetched successfully", { property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.user._id, req.files);
  return sendSuccess(res, "Property updated successfully", { property });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user._id);
  return sendSuccess(res, "Property deleted successfully");
});

export const searchProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.searchProperties(req.query);
  return sendSuccess(res, "Search completed successfully", { properties });
});