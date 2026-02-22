import mongoose, { Document, Schema } from "mongoose";

export type AdminRole = "superadmin" | "editor";

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: AdminRole;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [64, "Username cannot exceed 64 characters"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["superadmin", "editor"] satisfies AdminRole[],
        message: "Role must be superadmin or editor",
      },
      default: "editor",
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Index for fast login lookups
AdminSchema.index({ username: 1 });

export const Admin =
  (mongoose.models.Admin as mongoose.Model<IAdmin>) ??
  mongoose.model<IAdmin>("Admin", AdminSchema);
