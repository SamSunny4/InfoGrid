import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  isPublished: boolean;
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
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
    imageUrl:    { type: String, default: "" },
    imagePath:   { type: String, default: "" },
    isPublished: { type: Boolean, default: false, index: true },
    eventDate:   { type: Date, index: true },
  },
  { timestamps: true }
);

export const Event =
  (mongoose.models.Event as mongoose.Model<IEvent>) ??
  mongoose.model<IEvent>("Event", EventSchema);
