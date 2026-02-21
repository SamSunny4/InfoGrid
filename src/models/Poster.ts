import mongoose, { Document, Schema } from "mongoose";

export interface IPoster extends Document {
  imageUrl: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema = new Schema<IPoster>(
  {
    imageUrl: { type: String, required: [true, "Image is required"] },
    imagePath: { type: String, required: true },
  },
  { timestamps: true }
);

export const Poster =
  mongoose.models.Poster ?? mongoose.model<IPoster>("Poster", PosterSchema);
