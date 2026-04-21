import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.Mongo_DB_URL);
};

export default connectDB;
