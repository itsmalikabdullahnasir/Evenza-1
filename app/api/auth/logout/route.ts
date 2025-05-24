import { NextResponse } from "next/server"

export async function POST() {
  // Create a response
  const response = NextResponse.json({ message: "Logged out successfully" })

  // Clear the auth token cookie
  response.cookies.set({
    name: "authToken",
    value: "",
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
