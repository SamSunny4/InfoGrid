import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  newsUrl: string;   // Original article URL
  category: string;  // e.g. "AI", "Technology", "Science"
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
    newsUrl:   { type: String, default: "", trim: true },
    category:  { type: String, default: "General", trim: true, index: true },
  },
  { timestamps: true }
);

export const News =
  (mongoose.models.News as mongoose.Model<INews>) ??
  mongoose.model<INews>("News", NewsSchema);
