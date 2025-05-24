import mongoose, { Schema, type Document } from "mongoose"

// Define payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  REFUNDED = "refunded",
}

// Define payment type enum
export enum PaymentType {
  EVENT = "event",
  TRIP = "trip",
  INTERVIEW = "interview",
  MEMBERSHIP = "membership",
}

// Define the Payment interface
export interface IPayment extends Document {
  user: mongoose.Types.ObjectId
  userName?: string
  userEmail?: string
  amount: number
  paymentType: PaymentType
  relatedId: mongoose.Types.ObjectId // ID of the event, trip, etc.
  relatedTitle?: string
  proofImage: string
  status: PaymentStatus
  verifiedBy?: mongoose.Types.ObjectId
  verifiedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Create the Payment schema
const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String },
    userEmail: { type: String },
    amount: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
    relatedId: { type: Schema.Types.ObjectId, required: true },
    relatedTitle: { type: String },
    proofImage: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
)

// Create and export the Payment model
export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)
