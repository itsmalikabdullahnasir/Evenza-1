import { type NextRequest, NextResponse } from "next/server"
import { uploadFileToS3, validateFile } from "@/lib/file-upload"

// POST /api/upload - Upload a file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as "image" | "video"
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !["image", "video"].includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file type and size
    if (!validateFile(file, type)) {
      return NextResponse.json({ error: "Invalid file format or size" }, { status: 400 })
    }

    // Upload file to S3
    const fileUrl = await uploadFileToS3(file, folder)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
