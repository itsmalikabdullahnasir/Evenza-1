import mongoose, { Schema, type Document } from "mongoose"

// Define attendee interface
interface IAttendee {
  userId: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  tickets: number
  registeredAt: Date
  paymentStatus: string
  specialRequirements?: string
}

// Define the Event interface
export interface IEvent extends Document {
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  price: number
  maxAttendees: number
  attendees: IAttendee[]
  attendeeCount: number
  isFeatured: boolean
  image?: string
  isPublished: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

// Create attendee schema
const AttendeeSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  tickets: { type: Number, default: 1 },
  registeredAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, default: "pending" },
  specialRequirements: { type: String, default: "" },
})

// Create the Event schema
const EventSchema = new Schema<IEvent>({
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
  time: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "Other",
  },
  price: {
    type: Number,
    default: 0,
  },
  maxAttendees: {
    type: Number,
    default: 100,
  },
  attendees: {
    type: [AttendeeSchema],
    default: [],
  },
  attendeeCount: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
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
const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)

export default Event
