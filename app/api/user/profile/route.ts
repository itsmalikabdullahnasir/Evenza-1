import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/user/profile - Starting")

    // Get the auth token from the request
    const authToken = request.headers.get("Authorization")?.split(" ")[1] || request.cookies.get("authToken")?.value

    if (!authToken) {
      console.log("GET /api/user/profile - No auth token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the token
    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.NEXTAUTH_SECRET || "your-secret-key") as { id: string }
      userId = decoded.id
    } catch (error) {
      console.log("GET /api/user/profile - Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Find the user
    const user = await User.findById(userId).select("-password -mfaSecret").lean()

    if (!user) {
      console.log("GET /api/user/profile - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`GET /api/user/profile - Successfully fetched profile for user ${user._id}`)

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      studentId: user.studentId || "",
      department: user.department || "",
      year: user.year || "",
      bio: user.bio || "",
      profilePicture: user.profilePicture || "",
      role: user.role,
      mfaEnabled: user.mfaEnabled || false,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user/profile - Starting")

    // Get the auth token from the request
    const authToken = request.headers.get("Authorization")?.split(" ")[1] || request.cookies.get("authToken")?.value

    if (!authToken) {
      console.log("PUT /api/user/profile - No auth token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the token
    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.NEXTAUTH_SECRET || "your-secret-key") as { id: string }
      userId = decoded.id
    } catch (error) {
      console.log("PUT /api/user/profile - Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    const { name, phone, studentId, department, year, bio } = await request.json()

    // Find the user
    const user = await User.findById(userId)

    if (!user) {
      console.log("PUT /api/user/profile - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user fields
    if (name) user.name = name
    if (phone !== undefined) user.phone = phone
    if (studentId !== undefined) user.studentId = studentId
    if (department !== undefined) user.department = department
    if (year !== undefined) user.year = year
    if (bio !== undefined) user.bio = bio

    await user.save()

    console.log(`PUT /api/user/profile - Successfully updated profile for user ${user._id}`)

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        studentId: user.studentId || "",
        department: user.department || "",
        year: user.year || "",
        bio: user.bio || "",
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
