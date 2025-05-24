// This file handles file uploads for payment proofs and media

// TODO: Install necessary packages:
// npm install aws-sdk multer multer-s3

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

// Configure AWS S3 client
// Replace with your actual AWS credentials and region
// You should store these in environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "your-access-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "your-secret-key",
  },
})

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif"],
  video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
}

// Maximum file size (5MB for images, 50MB for videos)
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
}

// Function to validate file type and size
export function validateFile(file: File, type: "image" | "video"): boolean {
  if (!ALLOWED_FILE_TYPES[type].includes(file.type)) {
    return false
  }

  if (file.size > MAX_FILE_SIZE[type]) {
    return false
  }

  return true
}

// Function to upload file to S3
export async function uploadFileToS3(file: File, folder = "uploads"): Promise<string> {
  try {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "your-bucket-name",
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }

    await s3Client.send(new PutObjectCommand(params))

    // Return the file URL
    return `https://${params.Bucket}.s3.amazonaws.com/${fileName}`
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw new Error("Failed to upload file")
  }
}

// Function to delete file from S3
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    const urlParts = fileUrl.split(".s3.amazonaws.com/")
    if (urlParts.length !== 2) {
      throw new Error("Invalid S3 URL format")
    }

    const bucketParts = urlParts[0].split("//")
    const bucket = bucketParts[1]
    const key = urlParts[1]

    const params = {
      Bucket: bucket,
      Key: key,
    }

    await s3Client.send(new DeleteObjectCommand(params))
  } catch (error) {
    console.error("Error deleting file from S3:", error)
    throw new Error("Failed to delete file")
  }
}
