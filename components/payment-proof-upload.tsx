"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload, Check, AlertCircle } from "lucide-react"

interface PaymentProofUploadProps {
  onUploadComplete: (url: string) => void
  paymentType: string
  amount: number
}

export function PaymentProofUpload({ onUploadComplete, paymentType, amount }: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or GIF)")
      return false
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size must be less than 5MB")
      return false
    }

    return true
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (!validateFile(file)) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")
      formData.append("folder", "payment-proofs")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()
      setUploadedUrl(data.url)
      onUploadComplete(data.url)

      toast({
        title: "Upload successful",
        description: "Your payment proof has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(error instanceof Error ? error.message : "Failed to upload file")

      toast({
        title: "Upload failed",
        description: "There was an error uploading your payment proof.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Proof</CardTitle>
        <CardDescription>Upload a screenshot or photo of your payment receipt</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Type:</span>
            <span className="font-medium">{paymentType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Amount:</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-proof">Upload Payment Proof</Label>
          <Input
            id="payment-proof"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading || !!uploadedUrl}
          />
          {error && (
            <div className="flex items-center text-destructive text-sm mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {uploadedUrl && (
          <div className="mt-4">
            <div className="flex items-center text-green-600 text-sm mb-2">
              <Check className="h-4 w-4 mr-1" />
              <span>File uploaded successfully</span>
            </div>
            <div className="border rounded-md overflow-hidden">
              <img
                src={uploadedUrl || "/placeholder.svg"}
                alt="Payment proof"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading || !!uploadedUrl} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : uploadedUrl ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Proof
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
