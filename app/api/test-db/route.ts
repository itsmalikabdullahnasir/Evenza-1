import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ success: true, message: "Connected to MongoDB successfully!" })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({ success: false, error: "Failed to connect to MongoDB" }, { status: 500 })
  }
}
