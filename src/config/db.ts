import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL environment variable is not set");
  }
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUrl);
}

export default connectDB;
