import mongoose, { Document, Schema } from "mongoose";

export interface IPoster extends Document {
  title?: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema = new Schema<IPoster>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    imageUrl:    { type: String, required: [true, "Image is required"] },
    imagePath:   { type: String, required: [true, "Image path is required"] },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Poster =
  (mongoose.models.Poster as mongoose.Model<IPoster>) ??
  mongoose.model<IPoster>("Poster", PosterSchema);
