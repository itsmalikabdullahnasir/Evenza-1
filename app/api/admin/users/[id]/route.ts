import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/server-utils"

// Helper function to get token from request
function getTokenFromRequest(request: NextRequest) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const token = request.cookies.get("authToken")?.value
  if (token) {
    return token
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`GET request to /api/admin/users/${params.id}`)

    // Verify authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Find user by ID
    const userData = await User.findById(params.id)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`PUT request to /api/admin/users/${params.id}`)

    // Verify authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Get request body
    const data = await request.json()

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`DELETE request to /api/admin/users/${id}`)

    // Verify authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(request)
    if (!user) {
      console.log("Invalid token")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Find user to check if it's a super_admin
    const userToDelete = await User.findById(id)

    if (!userToDelete) {
      console.log("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting super_admin users
    if (userToDelete.role === "super_admin" && user.role !== "super_admin") {
      console.log("Attempt to delete super_admin by non-super_admin")
      return NextResponse.json({ error: "Cannot delete super_admin user" }, { status: 403 })
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(id)

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`User ${id} deleted successfully`)
    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
