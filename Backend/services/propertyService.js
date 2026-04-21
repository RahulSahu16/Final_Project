import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/appError.js";

const normalizeAmenities = (amenities) => {
  if (!amenities) return [];
  return Array.isArray(amenities) ? amenities : [amenities];
};

const normalizeLocation = (location) => {
  if (!location) return null;
  const parsed = typeof location === "string" ? JSON.parse(location) : location;
  return {
    lat: Number(parsed.lat),
    lng: Number(parsed.lng),
  };
};

export const createProperty = async (payload, userId, files = []) => {
  const images = files.map((file) => file.filename);
  const location = normalizeLocation(payload.location);
  return Property.create({
    ...payload,
    amenities: normalizeAmenities(payload.amenities),
    location,
    images,
    owner: userId,
  });
};

export const getAllProperties = async () => {
  return Property.find().populate("owner", "name email");
};

export const getPropertyById = async (propertyId) => {
  const property = await Property.findById(propertyId).populate("owner", "name email");
  if (!property) throw new AppError("Property not found", 404);
  return property;
};

export const updateProperty = async (propertyId, payload, userId, files = []) => {
  const property = await Property.findById(propertyId);
  if (!property) throw new AppError("Property not found", 404);
  if (property.owner.toString() !== userId.toString()) {
    throw new AppError("Unauthorized to update this property", 403);
  }

  const images = files.length ? files.map((file) => file.filename) : property.images;
  const location = payload.location ? normalizeLocation(payload.location) : property.location;
  property.set({
    ...payload,
    amenities: normalizeAmenities(payload.amenities),
    location,
    images,
  });
  await property.save();
  return property;
};

export const deleteProperty = async (propertyId, userId) => {
  const property = await Property.findById(propertyId);
  if (!property) throw new AppError("Property not found", 404);
  if (property.owner.toString() !== userId.toString()) {
    throw new AppError("Unauthorized to delete this property", 403);
  }
  await property.deleteOne();
};

export const searchProperties = async ({ city, checkIn, checkOut }) => {
  const searchRegex = city ? new RegExp(city, "i") : null;
  const filters = searchRegex
    ? { $or: [{ address: { $regex: searchRegex } }, { title: { $regex: searchRegex } }] }
    : {};

  const properties = await Property.find(filters).populate("owner", "name email");
  if (!checkIn || !checkOut) return properties;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const available = [];
  for (const property of properties) {
    const conflicting = await Booking.findOne({
      propertyId: property._id,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (!conflicting) available.push(property);
  }

  return available;
};
