import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { Types } from "mongoose"

// Verify JWT token from request
export async function verifyToken(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as string)
    return decoded as { id: string; email: string; role: string }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Check if a string is a valid MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id)
}

// Format error response
export function formatErrorResponse(error: unknown, defaultMessage = "An error occurred") {
  return {
    error: error instanceof Error ? error.message : defaultMessage,
  }
}

// Parse query parameters
export function parseQueryParams(req: NextRequest) {
  const url = new URL(req.url)
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""
  const status = url.searchParams.get("status") || ""
  const sort = url.searchParams.get("sort") || "createdAt"
  const order = url.searchParams.get("order") || "desc"

  return {
    page,
    limit,
    search,
    status,
    sort,
    order,
    skip: (page - 1) * limit,
  }
}
