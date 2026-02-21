import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    imageUrl: { type: String, default: "" },
    imagePath: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Event =
  mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);
