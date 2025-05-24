import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Interview from "@/models/Interview"

export async function GET() {
  try {
    console.log("GET /api/interviews - Starting")
    await connectToDatabase()

    // Get all published interviews
    const interviews = await Interview.find({ isPublished: true }).sort({ date: 1 }).lean()

    console.log(`GET /api/interviews - Found ${interviews.length} interviews`)
    return NextResponse.json({ interviews })
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch interviews" },
      { status: 500 },
    )
  }
}
