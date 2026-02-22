import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string; // R2 object key for deletion
  eventDate?: Date;
  eventTime?: string; // e.g. "10:30 AM"
  eventUrl?: string;  // Link to event details / registration
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
    imageUrl:  { type: String, default: "" },
    imagePath: { type: String, default: "" },
    eventDate: { type: Date, index: true },
    eventTime: { type: String, default: "", trim: true },
    eventUrl:  { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export const Event =
  (mongoose.models.Event as mongoose.Model<IEvent>) ??
  mongoose.model<IEvent>("Event", EventSchema);
