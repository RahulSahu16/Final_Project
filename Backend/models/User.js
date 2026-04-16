// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  roles: {
    type: [String],
    default: ["customer"]
  },

  favourites: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    },
  ],

}, { timestamps: true });

export default mongoose.model("User", userSchema);