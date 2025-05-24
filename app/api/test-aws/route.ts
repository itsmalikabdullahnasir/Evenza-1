import { NextResponse } from "next/server"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"

export async function GET() {
  try {
    // Create an S3 client using the environment variables
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })

    // Try to list buckets to verify credentials
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)

    // Check if our bucket exists in the list
    const bucketExists = response.Buckets?.some((bucket) => bucket.Name === process.env.AWS_S3_BUCKET)

    return NextResponse.json({
      success: true,
      message: "AWS S3 connection successful!",
      bucketExists: bucketExists,
      bucketName: process.env.AWS_S3_BUCKET,
    })
  } catch (error) {
    console.error("AWS connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to AWS S3",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
