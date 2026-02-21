import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string; // GCS object path for deletion
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    imageUrl: { type: String, default: "" },
    imagePath: { type: String, default: "" },
  },
  { timestamps: true }
);

export const News =
  mongoose.models.News ?? mongoose.model<INews>("News", NewsSchema);
