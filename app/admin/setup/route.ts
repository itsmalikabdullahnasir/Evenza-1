import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectToDatabase()

    // Check if admin user exists
    const adminExists = await User.findOne({ role: { $in: ["admin", "super_admin"] } })

    if (adminExists) {
      return NextResponse.json({
        message: "Admin user already exists",
        adminExists: true,
      })
    }

    return NextResponse.json({
      message: "No admin user found",
      adminExists: false,
    })
  } catch (error) {
    console.error("Error checking admin:", error)
    return NextResponse.json({ error: "Failed to check admin status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if admin user already exists
    const adminExists = await User.findOne({ role: { $in: ["admin", "super_admin"] } })

    if (adminExists) {
      return NextResponse.json({
        message: "Admin user already exists",
        adminExists: true,
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await adminUser.save()

    return NextResponse.json({
      message: "Admin user created successfully",
      success: true,
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
