import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Trip from "@/models/Trip"

export async function GET() {
  try {
    console.log("GET /api/trips - Starting")
    await connectToDatabase()

    // Get all published trips
    const trips = await Trip.find({ isPublished: true }).sort({ date: 1 }).lean()

    console.log(`GET /api/trips - Found ${trips.length} trips`)
    return NextResponse.json({ trips })
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch trips" },
      { status: 500 },
    )
  }
}
