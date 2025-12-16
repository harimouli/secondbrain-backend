import mongoose from "mongoose";
const { Schema } = mongoose;

interface RefreshToken {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked?: boolean;
}
const RefreshTokenSchema = new Schema<RefreshToken>({
  token: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
});

export const RefreshTokenModel = mongoose.model<RefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
