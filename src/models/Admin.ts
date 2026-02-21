import mongoose, { Document, Schema } from "mongoose";

export type AdminRole = "superadmin" | "editor";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: AdminRole;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
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
AdminSchema.index({ email: 1 });

export const Admin =
  (mongoose.models.Admin as mongoose.Model<IAdmin>) ??
  mongoose.model<IAdmin>("Admin", AdminSchema);
