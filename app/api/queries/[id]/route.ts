import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Query, { QueryStatus } from "@/models/Query"
import mongoose from "mongoose"

// GET /api/queries/[id] - Get query by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid query ID format" }, { status: 400 })
    }

    const query = await Query.findById(id).populate("user", "name email").populate("respondedBy", "name").lean()

    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    // TODO: Add authorization to ensure only the user who created the query or admins can view it

    return NextResponse.json(query)
  } catch (error) {
    console.error("Error fetching query:", error)
    return NextResponse.json({ error: "Failed to fetch query" }, { status: 500 })
  }
}

// PUT /api/queries/[id] - Update query (respond to query)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // TODO: Add authentication to ensure only admins can respond to queries
    // For now, we'll use a respondedBy ID from the request body

    const { id } = params
    const { response, respondedById } = await req.json()

    // Validate required fields
    if (!response || !respondedById) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate ID formats
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(respondedById)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      {
        $set: {
          response,
          respondedBy: respondedById,
          respondedAt: new Date(),
          status: QueryStatus.ANSWERED,
        },
      },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedQuery) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    return NextResponse.json(updatedQuery)
  } catch (error) {
    console.error("Error updating query:", error)
    return NextResponse.json({ error: "Failed to update query" }, { status: 500 })
  }
}
