import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 1 },
    address: { type: String, required: true, trim: true },
    totalRooms: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
    rules: { type: String, default: "" },
    images: [{ type: String }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);