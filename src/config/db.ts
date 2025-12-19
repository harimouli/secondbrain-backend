import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;
  console.log("Connecting to MongoDB...");
  if (!mongoUrl) {
    throw new Error("MONGO_URL environment variable is not bhai");
  }
  await mongoose.connect(mongoUrl);
}

export default connectDB;
