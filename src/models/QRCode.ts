import mongoose, { Document, Schema } from "mongoose";

export interface IQRCode extends Document {
  title: string;
  imageUrl: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    imageUrl: { type: String, required: [true, "QR image is required"] },
    imagePath: { type: String, required: true },
  },
  { timestamps: true }
);

export const QRCode =
  mongoose.models.QRCode ?? mongoose.model<IQRCode>("QRCode", QRCodeSchema);
