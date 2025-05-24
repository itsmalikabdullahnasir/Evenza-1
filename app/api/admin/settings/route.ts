import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Setting from "@/models/Setting"
import { verifyToken } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/settings - Starting")

    // Verify admin authentication
    const tokenData = await verifyToken(request)
    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("GET /api/admin/settings - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get all settings
    const settings = await Setting.find({}).lean()

    // Convert to key-value pairs
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    console.log("GET /api/admin/settings - Successfully fetched settings")

    return NextResponse.json({ success: true, settings: settingsObject })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/settings - Starting")

    // Verify admin authentication
    const tokenData = await verifyToken(request)
    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("POST /api/admin/settings - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    const data = await request.json()

    // Validate data
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
    }

    const { category, settings } = data

    if (!category || !settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings data format" }, { status: 400 })
    }

    // Update settings
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const settingKey = `${category}.${key}`
      return Setting.findOneAndUpdate(
        { key: settingKey },
        { key: settingKey, value, category },
        { upsert: true, new: true },
      )
    })

    await Promise.all(updatePromises)

    console.log("POST /api/admin/settings - Successfully updated settings")

    return NextResponse.json({ success: true, message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
