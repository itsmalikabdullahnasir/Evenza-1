import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { isValidObjectId, verifyToken } from "@/lib/server-utils"
import Payment, { PaymentStatus } from "@/models/Payment"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`PUT /api/admin/payments/${params.id}/status - Starting`)

    // Verify authentication
    const tokenData = await verifyToken(request)
    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log(`PUT /api/admin/payments/${params.id}/status - Unauthorized access attempt`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    // Get request body
    const data = await request.json()

    // Validate status
    if (!data.status || !Object.values(PaymentStatus).includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Update payment status
    const result = await Payment.findByIdAndUpdate(
      id,
      {
        status: data.status,
        verifiedBy: new mongoose.Types.ObjectId(tokenData.id),
        verifiedAt: new Date(),
        notes: data.notes || "",
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    console.log(`PUT /api/admin/payments/${params.id}/status - Payment status updated successfully`)
    return NextResponse.json({ success: true, payment: result })
  } catch (error) {
    console.error("Error updating payment status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
