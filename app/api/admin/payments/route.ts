import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Payment from "@/models/Payment"
import { verifyAdminToken } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/payments - Starting")

    // Verify admin authentication
    const tokenData = await verifyAdminToken(request)
    if (!tokenData) {
      console.log("GET /api/admin/payments - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ userId: { $regex: search, $options: "i" } }, { relatedId: { $regex: search, $options: "i" } }]
    }

    if (status && status !== "all") {
      query.status = status
    }

    if (type && type !== "all") {
      query.type = type
    }

    // Count total payments
    const total = await Payment.countDocuments(query)

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .lean()

    // Format payments for response
    const formattedPayments = payments.map((payment) => ({
      _id: payment._id.toString(),
      userId: payment.userId._id.toString(),
      userName: payment.userId.name,
      userEmail: payment.userId.email,
      type: payment.type,
      relatedId: payment.relatedId.toString(),
      amount: payment.amount,
      status: payment.status,
      proofUrl: payment.proofUrl,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }))

    console.log(`GET /api/admin/payments - Found ${formattedPayments.length} payments`)

    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
