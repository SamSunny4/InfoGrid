import mongoose, { Document, Schema } from "mongoose";

export interface IQRCode extends Document {
  title: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  redirectUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    imageUrl:    { type: String, required: [true, "QR image is required"] },
    imagePath:   { type: String, required: [true, "Image path is required"] },
    // Optional URL the QR code encodes / links to
    redirectUrl: { type: String, trim: true, default: "" },
    isActive:    { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const QRCode =
  (mongoose.models.QRCode as mongoose.Model<IQRCode>) ??
  mongoose.model<IQRCode>("QRCode", QRCodeSchema);
