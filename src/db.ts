import mongoose from "mongoose";
const { Schema, model } = mongoose;
import dotenv from "dotenv";

dotenv.config();

interface User {
  username: string;
  password: string;
  isShareEnabled?: boolean;
  dateOfJoined?: Date;
}

interface Content {
  title: string;
  link: string;
  type: string;
  share?: boolean;
  tags?: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
}

export interface Link {
  hash: string;
  userId: mongoose.Types.ObjectId;
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
  isShareEnabled: { type: Boolean, default: false },
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
