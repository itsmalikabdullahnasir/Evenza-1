import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get("Authorization")
    const token = authHeader ? authHeader.replace("Bearer ", "") : request.cookies.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key") as {
      id: string
      email: string
      role: string
    }

    // Connect to database
    await connectToDatabase()

    // Find user
    const user = await User.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Check admin error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
