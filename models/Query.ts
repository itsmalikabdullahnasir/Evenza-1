import mongoose, { Schema, type Document } from "mongoose"

// Define query status enum
export enum QueryStatus {
  NEW = "new",
  OPEN = "open",
  ANSWERED = "answered",
  CLOSED = "closed",
}

// Define the Query interface
export interface IQuery extends Document {
  user: mongoose.Types.ObjectId
  subject: string
  message: string
  status: QueryStatus
  response?: string
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
  name: string
  email: string
}

// Create the Query schema
const QuerySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(QueryStatus),
      default: QueryStatus.NEW,
    },
    response: { type: String },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
  },
  { timestamps: true },
)

// Create and export the Query model
export default mongoose.models.Query || mongoose.model<IQuery>("Query", QuerySchema)
