import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { email, password, rememberMe } = body

    console.log("Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Ensure email is a string
    if (typeof email !== "string") {
      console.error("Email is not a string:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "your-secret-key",
      { expiresIn: rememberMe ? "30d" : "1d" },
    )

    console.log("Generated JWT token for user:", user.email, "with role:", user.role)

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })

    // Set HTTP-only cookie for added security
    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
