import mongoose from "mongoose";
const { Schema } = mongoose;

interface RefreshToken {
  token: string;
  userId: mongoose.Types.ObjectId;
}

const RefreshTokenSchema = new Schema<RefreshToken>({
  token: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },
});

export const RefreshTokenModel = mongoose.model<RefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
