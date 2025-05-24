import mongoose, { Schema, type Document } from "mongoose"

export interface IInterview extends Document {
  title: string
  company: string
  description: string
  date: string
  location: string
  positions: string[]
  registrations: number
  applicants: Array<{
    userId: mongoose.Types.ObjectId
    name: string
    email: string
    phone: string
    position: string
    appliedAt: Date
    status: string
  }>
  image?: string
  isPublished: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

const InterviewSchema = new Schema<IInterview>({
  title: {
    type: String,
    required: true,
  },
  company: {
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
  positions: {
    type: [String],
    required: true,
  },
  registrations: {
    type: Number,
    default: 0,
  },
  applicants: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        phone: String,
        position: String,
        appliedAt: Date,
        status: String,
      },
    ],
    default: [],
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
    enum: ["active", "closed", "completed"],
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
const Interview = mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema)

export default Interview
