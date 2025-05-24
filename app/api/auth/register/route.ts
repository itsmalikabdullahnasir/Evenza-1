import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const { name, email, password } = await req.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      registeredEvents: [],
      registeredTrips: [],
      registeredInterviews: [],
    })

    // Save the user to the database
    await newUser.save()

    // Return success response (without password)
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    }

    return NextResponse.json({ message: "User registered successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}
