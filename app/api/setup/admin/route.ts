import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User, { UserRole } from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase()

    const { name, email, password } = await req.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      // If user exists but is not admin, update to admin
      if (existingUser.role !== UserRole.ADMIN && existingUser.role !== UserRole.SUPER_ADMIN) {
        existingUser.role = UserRole.ADMIN
        await existingUser.save()

        return NextResponse.json({
          message: "User updated to admin successfully",
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
        })
      }

      return NextResponse.json({
        message: "Admin user already exists",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new admin user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      registeredEvents: [],
      registeredTrips: [],
      interviewSubmissions: [],
    })

    await newUser.save()

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
