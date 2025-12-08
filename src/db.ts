import mongoose from "mongoose";
const { Schema, model } = mongoose;
import dotenv from "dotenv";

dotenv.config();

interface User {
  username: string;
  password: string;
  activeShare?: boolean;
  dateOfJoined?: Date;
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL environment variable is not bhai");
  }
  await mongoose.connect(mongoUrl);
}

export const UserSchema = new Schema<User>({
  username: { type: String, unique: true },
  password: String,
  activeShare: { type: Boolean, default: false },
  dateOfJoined: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model("Users", UserSchema);

const ContentSchema = new Schema({
  title: String,
  link: String,
  type: String,
  share: { type: Boolean, default: false },
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "Users" },
});

export const ContentModel = mongoose.model("Content", ContentSchema);

const LinkSchema = new Schema({
  hash: { type: String, unique: true },
  userId: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
});

export const LinkModel = mongoose.model("Links", LinkSchema);
main();
