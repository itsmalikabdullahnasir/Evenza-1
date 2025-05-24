import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"
import jwt from "jsonwebtoken"

// GET /api/admin/events - Get all events
export async function GET(request: NextRequest) {
  console.log("GET /api/admin/events - Request received")

  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    let token = authHeader && authHeader.split(" ")[1]
    console.log("Auth header token:", token ? "Found" : "Not found")

    // If no token in header, try to get it from cookies
    if (!token) {
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        token = cookies.authToken
        console.log("Cookie token:", token ? "Found" : "Not found")
      }
    }

    // Verify the token
    if (!token) {
      console.log("No token found in request")
      return NextResponse.json({ success: false, error: "Unauthorized - No token provided" }, { status: 401 })
    }

    try {
      console.log("Verifying token...")
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key") as jwt.JwtPayload

      if (!decoded || !decoded.role || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
        console.log("Invalid token or insufficient permissions:", decoded)
        return NextResponse.json({ success: false, error: "Unauthorized - Invalid permissions" }, { status: 401 })
      }

      console.log("Token verified successfully for user role:", decoded.role)
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 401 },
      )
    }

    // Connect to database
    try {
      await connectToDatabase()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Get all events
    try {
      console.log("Querying events from database...")
      const events = await Event.find().sort({ createdAt: -1 }).lean()
      console.log(`Found ${events?.length || 0} events`)
      return NextResponse.json({ success: true, events: events || [] })
    } catch (queryError) {
      console.error("Error querying events:", queryError)

      // Return mock data as fallback
      const mockEvents = [
        {
          id: "1",
          title: "Tech Innovation Summit",
          description: "Join industry leaders to explore the latest technological innovations and future trends.",
          date: "2025-04-15",
          time: "9:00 AM - 5:00 PM",
          location: "Grand Conference Center",
          category: "Technology",
          price: 99,
          attendees: 120,
          maxAttendees: 200,
          isFeatured: true,
        },
        {
          id: "2",
          title: "Business Networking Mixer",
          description: "Connect with professionals from various industries in a relaxed setting.",
          date: "2025-04-22",
          time: "6:00 PM - 9:00 PM",
          location: "Urban Lounge",
          category: "Networking",
          price: 25,
          attendees: 45,
          maxAttendees: 100,
          isFeatured: false,
        },
        {
          id: "3",
          title: "Creative Arts Workshop",
          description: "Hands-on workshop exploring various art forms and creative expression techniques.",
          date: "2025-05-05",
          time: "10:00 AM - 3:00 PM",
          location: "Community Arts Center",
          category: "Arts",
          price: 50,
          attendees: 30,
          maxAttendees: 50,
          isFeatured: false,
        },
      ]

      return NextResponse.json({
        success: false,
        error: "Error querying events",
        details: queryError instanceof Error ? queryError.message : String(queryError),
        events: mockEvents,
      })
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST /api/admin/events - Create a new event (admin only)
export async function POST(request: NextRequest) {
  console.log("POST /api/admin/events - Request received")

  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    let token = authHeader && authHeader.split(" ")[1]
    console.log("Auth header token:", token ? "Found" : "Not found")

    // If no token in header, try to get it from cookies
    if (!token) {
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        token = cookies.authToken
        console.log("Cookie token:", token ? "Found" : "Not found")
      }
    }

    // Verify the token
    if (!token) {
      console.log("No token found in request")
      return NextResponse.json({ success: false, error: "Unauthorized - No token provided" }, { status: 401 })
    }

    try {
      console.log("Verifying token...")
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key") as jwt.JwtPayload

      if (!decoded || !decoded.role || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
        console.log("Invalid token or insufficient permissions:", decoded)
        return NextResponse.json({ success: false, error: "Unauthorized - Invalid permissions" }, { status: 401 })
      }

      console.log("Token verified successfully for user role:", decoded.role)
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 401 },
      )
    }

    // Get request body
    const body = await request.json()
    console.log("Request body:", body)

    // Validate required fields
    const requiredFields = ["title", "description", "date", "location", "category", "maxAttendees"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Connect to database
    try {
      await connectToDatabase()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Create new event
    try {
      console.log("Creating new event...")
      const newEvent = new Event({
        title: body.title,
        description: body.description,
        date: body.date,
        time: body.time || "",
        location: body.location || "",
        category: body.category || "Other",
        price: body.price || 0,
        maxAttendees: body.maxAttendees || 100,
        isFeatured: body.isFeatured || false,
        attendees: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add an image field for the event
        image: body.image || `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(body.title)}`,
        // Make sure the event is visible to users
        isPublished: true,
      })

      await newEvent.save()
      console.log("Event created successfully:", newEvent._id)
      return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
    } catch (dbError: any) {
      console.error("Error saving new event:", dbError)

      // Return mock success response for demo purposes
      const mockEvent = {
        id: Date.now().toString(),
        title: body.title,
        description: body.description,
        date: body.date,
        time: body.time || "",
        location: body.location || "",
        category: body.category || "Other",
        price: body.price || 0,
        maxAttendees: body.maxAttendees || 100,
        isFeatured: body.isFeatured || false,
        attendees: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(body.title)}`,
        isPublished: true,
      }

      return NextResponse.json(
        {
          success: false,
          error: "Error saving event to database",
          details: dbError.message,
          event: mockEvent,
        },
        { status: 201 },
      )
    }
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
