import mongoose, { Schema, type Document } from "mongoose"

export enum InterviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IInterviewSubmission extends Document {
  user: mongoose.Types.ObjectId
  interview: mongoose.Types.ObjectId
  position: string
  education: string
  experience: string
  coverLetter: string
  status: InterviewStatus
  adminNotes?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const InterviewSubmissionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    interview: { type: Schema.Types.ObjectId, ref: "Interview", required: true },
    position: { type: String, required: true },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    coverLetter: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.PENDING,
    },
    adminNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only apply once for a specific interview
InterviewSubmissionSchema.index({ user: 1, interview: 1 }, { unique: true })

export default mongoose.models.InterviewSubmission ||
  mongoose.model<IInterviewSubmission>("InterviewSubmission", InterviewSubmissionSchema)
