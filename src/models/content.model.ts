import mongoose from "mongoose";
const { Schema } = mongoose;

interface Content {
  title: string;
  link: string;
  type: "youtube" | "twitter" | "article" | "note" | "website" | "X";
  share?: boolean;
  userId: mongoose.Types.ObjectId;
}

const ContentSchema = new Schema<Content>({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true },
  type: {
    type: String,
    enum: ["youtube", "twitter", "article", "note", "website"],
    required: true,
  },
  share: { type: Boolean, default: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },
});

export const ContentModel = mongoose.model<Content>("Content", ContentSchema);
