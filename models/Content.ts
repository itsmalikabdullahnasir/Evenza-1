import mongoose, { Schema } from "mongoose"

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["page", "post", "legal", "faq"],
      default: "page",
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isHomepage: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Create or get the model
const Content = mongoose.models.Content || mongoose.model("Content", ContentSchema)

export default Content
