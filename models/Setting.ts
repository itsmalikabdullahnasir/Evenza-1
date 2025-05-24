import mongoose, { Schema } from "mongoose"

const SettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
)

// Create or get the model
export const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema)
