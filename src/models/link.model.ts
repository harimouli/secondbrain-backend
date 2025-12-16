import mongoose from "mongoose";
const { Schema } = mongoose;
export interface Link {
  hash: string;
  userId: mongoose.Types.ObjectId;
}

const LinkSchema = new Schema<Link>({
  hash: { type: String, unique: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },
});
export const LinkModel = mongoose.model("Link", LinkSchema);
