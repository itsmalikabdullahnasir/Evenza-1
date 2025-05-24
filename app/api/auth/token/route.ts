import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET() {
  try {
    // Ensure we await the getServerSession call
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create a JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const token = jwt.sign(
      {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      secret,
      { expiresIn: "1d" },
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
