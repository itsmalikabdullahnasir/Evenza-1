import mongoose, { Schema, type Document } from "mongoose"

// Define media type enum
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

// Define the Media interface
export interface IMedia extends Document {
  title: string
  description?: string
  type: MediaType
  url: string
  category: string
  relatedEvent?: mongoose.Types.ObjectId
  relatedTrip?: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Create the Media schema
const MediaSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: Object.values(MediaType),
      required: true,
    },
    url: { type: String, required: true },
    category: { type: String, required: true },
    relatedEvent: { type: Schema.Types.ObjectId, ref: "Event" },
    relatedTrip: { type: Schema.Types.ObjectId, ref: "Trip" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

// Create and export the Media model
export default mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema)
