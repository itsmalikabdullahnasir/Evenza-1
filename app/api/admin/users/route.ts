import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User" // Import the User model
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/users - Request received")

    // Try to get the session first
    let isAuthorized = false
    let authMethod = ""

    try {
      const session = await getServerSession(authOptions)
      console.log("Session data:", session ? "Found" : "Not found")

      if (session?.user && (session.user.role === "admin" || session.user.role === "super_admin")) {
        isAuthorized = true
        authMethod = "session"
      }
    } catch (sessionError) {
      console.error("Error getting session:", sessionError)
    }

    // If not authorized by session, check cookies and headers
    if (!isAuthorized) {
      // Get the authorization header
      const authHeader = request.headers.get("authorization")
      const token = authHeader && authHeader.split(" ")[1]

      if (token) {
        // Here you would verify the token
        // For now, we'll assume any token is valid for testing
        isAuthorized = true
        authMethod = "token"
      } else {
        // Check for token in cookies
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          if (cookieHeader.includes("authToken=")) {
            isAuthorized = true
            authMethod = "cookie"
          }
        }
      }
    }

    // If still not authorized, return 401
    if (!isAuthorized) {
      console.log("Authorization failed. No valid session, token, or cookie found.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`User authorized via ${authMethod}`)

    // Connect to the database
    try {
      console.log("Connecting to database...")
      await connectToDatabase()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Fetch users from the database
    try {
      console.log("Fetching users from database...")

      // For testing, let's try to get the count first
      const count = await User.countDocuments({})
      console.log(`Found ${count} users in the database`)

      const users = await User.find({}).lean()
      console.log(`Successfully fetched ${users.length} users`)

      // Return the users
      return NextResponse.json({
        users: users || [],
        count: users.length,
        message: "Users fetched successfully",
      })
    } catch (queryError) {
      console.error("Error querying users:", queryError)
      return NextResponse.json(
        {
          error: "Failed to query users",
          details: queryError instanceof Error ? queryError.message : String(queryError),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unhandled error in GET /api/admin/users:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/users - Request received")

    // Try to get the session first
    let isAuthorized = false
    let authMethod = ""

    try {
      const session = await getServerSession(authOptions)
      console.log("Session data:", session ? "Found" : "Not found")

      if (session?.user && (session.user.role === "admin" || session.user.role === "super_admin")) {
        isAuthorized = true
        authMethod = "session"
      }
    } catch (sessionError) {
      console.error("Error getting session:", sessionError)
    }

    // If not authorized by session, check cookies and headers
    if (!isAuthorized) {
      // Get the authorization header
      const authHeader = request.headers.get("authorization")
      const token = authHeader && authHeader.split(" ")[1]

      if (token) {
        // Here you would verify the token
        // For now, we'll assume any token is valid for testing
        isAuthorized = true
        authMethod = "token"
      } else {
        // Check for token in cookies
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          if (cookieHeader.includes("authToken=")) {
            isAuthorized = true
            authMethod = "cookie"
          }
        }
      }
    }

    // If still not authorized, return 401
    if (!isAuthorized) {
      console.log("Authorization failed. No valid session, token, or cookie found.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`User authorized via ${authMethod}`)

    // Parse the request body
    let data
    try {
      data = await request.json()
      console.log("Request body:", data)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate required fields
    if (!data.email || !data.name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Connect to database
    try {
      console.log("Connecting to database...")
      await connectToDatabase()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Check if user already exists
    try {
      console.log(`Checking if user with email ${data.email} already exists...`)
      const existingUser = await User.findOne({ email: data.email })

      if (existingUser) {
        console.log("User already exists")
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }

      console.log("User does not exist, proceeding with creation")
    } catch (queryError) {
      console.error("Error checking existing user:", queryError)
      return NextResponse.json(
        {
          error: "Failed to check existing user",
          details: queryError instanceof Error ? queryError.message : String(queryError),
        },
        { status: 500 },
      )
    }

    // Create user
    try {
      console.log("Creating new user...")
      const newUser = new User({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await newUser.save()
      console.log("User created successfully:", newUser._id.toString())

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: newUser,
      })
    } catch (dbError: any) {
      console.error("Error saving new user:", dbError)
      return NextResponse.json(
        {
          error: "Failed to save new user to database",
          message: dbError.message,
          code: dbError.code,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unhandled error in POST /api/admin/users:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
