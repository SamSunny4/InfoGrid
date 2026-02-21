import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  isPublished: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    imageUrl:  { type: String, default: "" },
    imagePath: { type: String, default: "" },
    isPublished: { type: Boolean, default: false, index: true },
    // Higher number = shown first (1 = low, 10 = high)
    priority:   { type: Number, default: 5, min: 1, max: 10, index: true },
  },
  { timestamps: true }
);

export const News =
  (mongoose.models.News as mongoose.Model<INews>) ??
  mongoose.model<INews>("News", NewsSchema);
