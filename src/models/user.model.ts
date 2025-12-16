import mongoose from "mongoose";
const { Schema } = mongoose;

export interface User {
  username: string;
  email: string;
  password: string;
  isShareEnabled?: boolean;
  dateOfJoined?: Date;
}

const UserSchema = new Schema<User>({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  isShareEnabled: { type: Boolean, default: false },
  dateOfJoined: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<User>("User", UserSchema);
