import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    const { currentPassword, newPassword } = await req.json()

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 })
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
