import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("Testing database connection...")

    // Get the MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!mongoUri) {
      console.error("No MongoDB URI found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "No MongoDB URI found in environment variables",
          database: null,
          host: null,
        },
        { status: 500 },
      )
    }

    // Mask sensitive parts of the URI for logging
    const maskedUri = mongoUri.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, "mongodb+srv://$1:****@")
    console.log("MongoDB URI:", maskedUri)

    // Try to connect to the database
    try {
      const client = await connectToDatabase()

      if (!client) {
        console.error("Failed to connect to database")
        return NextResponse.json(
          {
            success: false,
            error: "Failed to connect to database",
            database: null,
            host: null,
          },
          { status: 500 },
        )
      }

      // Extract database name and host from URI
      const uriParts = mongoUri.split("/")
      const database = uriParts[uriParts.length - 1].split("?")[0]

      // Extract host from URI
      let host = "Unknown"
      const hostMatch = mongoUri.match(/@([^/]+)\//)
      if (hostMatch && hostMatch[1]) {
        host = hostMatch[1]
      }

      console.log("Connected to MongoDB successfully")
      console.log("Database:", database)
      console.log("Host:", host)

      return NextResponse.json({
        success: true,
        message: `Connected to ${database} at ${host}`,
        database,
        host,
      })
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: dbError.message || "Failed to connect to database",
          details: dbError.stack,
          database: null,
          host: null,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error testing database connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to database",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        database: null,
        host: null,
      },
      { status: 500 },
    )
  }
}
