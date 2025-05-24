import mongoose, { Schema, type Document } from "mongoose"

// Define participant interface
interface IParticipant {
  userId: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  enrolledAt: Date
  paymentStatus: string
  emergencyContact: string
  specialRequirements?: string
}

// Define the Trip interface
export interface ITrip extends Document {
  title: string
  description: string
  date: string
  location: string
  price: number
  spots: number
  enrollments: number
  participants: IParticipant[]
  itinerary?: string
  requirements?: string
  image?: string
  isPublished: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

// Create participant schema
const ParticipantSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  enrolledAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, default: "pending" },
  emergencyContact: { type: String, default: "" },
  specialRequirements: { type: String, default: "" },
})

// Create the Trip schema
const TripSchema = new Schema<ITrip>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  spots: {
    type: Number,
    required: true,
    default: 20,
  },
  enrollments: {
    type: Number,
    default: 0,
  },
  participants: {
    type: [ParticipantSchema],
    default: [],
  },
  itinerary: {
    type: String,
  },
  requirements: {
    type: String,
  },
  image: {
    type: String,
    default: "/placeholder.svg?height=300&width=500",
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "cancelled", "completed"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create the model if it doesn't exist
const Trip = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema)

export default Trip
