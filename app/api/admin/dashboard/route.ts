import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Event from "@/models/Event"
import Trip from "@/models/Trip"
import Interview from "@/models/Interview"
import Payment from "@/models/Payment"
import Message from "@/models/Message"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization")
    console.log("Dashboard API - Auth header:", authHeader ? "Found" : "Not found")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Try to get token from cookies as fallback
      const cookies = req.headers.get("cookie")
      let tokenFromCookie = null

      if (cookies) {
        const authCookie = cookies.split(";").find((c) => c.trim().startsWith("authToken="))
        if (authCookie) {
          tokenFromCookie = authCookie.split("=")[1]
          console.log("Found token in cookie")
        }
      }

      if (!tokenFromCookie) {
        console.log("No authorization header or cookie found")
        return NextResponse.json({ message: "Unauthorized: No auth token found in header or cookie" }, { status: 401 })
      }

      // Use the token from cookie
      try {
        jwt.verify(tokenFromCookie, process.env.NEXTAUTH_SECRET || "your-secret-key")
      } catch (error) {
        console.error("Token verification error:", error)
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
      }
    } else {
      // Extract the token from header
      const token = authHeader.split(" ")[1]

      try {
        // Verify the token
        jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key")
      } catch (error) {
        console.error("Token verification error:", error)
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
      }
    }

    // Connect to the database
    await connectToDatabase()

    // Fetch dashboard data
    const [totalUsers, totalEvents, totalTrips, totalInterviews, totalPayments, totalMessages] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Trip.countDocuments(),
      Interview.countDocuments(),
      Payment.countDocuments(),
      Message.countDocuments(),
    ])

    // Sample data for charts and graphs
    const userGrowth = [
      { month: "Jan", users: 10 },
      { month: "Feb", users: 20 },
      { month: "Mar", users: 30 },
      { month: "Apr", users: 40 },
      { month: "May", users: 50 },
    ]

    const revenueData = [
      { month: "Jan", revenue: 1000 },
      { month: "Feb", revenue: 2000 },
      { month: "Mar", revenue: 3000 },
      { month: "Apr", revenue: 4000 },
      { month: "May", revenue: 5000 },
    ]

    const activityByType = [
      { type: "Events", count: 10 },
      { type: "Trips", count: 20 },
      { type: "Interviews", count: 30 },
      { type: "Messages", count: 40 },
    ]

    // Sample recent activity
    const recentActivity = [
      {
        id: "1",
        type: "User Registration",
        user: "John Doe",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "Event Created",
        user: "Admin",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        type: "Payment Received",
        user: "Jane Smith",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ]

    // Return dashboard data
    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalTrips,
      totalInterviews,
      totalPayments,
      totalMessages,
      recentActivity,
      userGrowth,
      revenueData,
      activityByType,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ message: "An error occurred while fetching dashboard data" }, { status: 500 })
  }
}
