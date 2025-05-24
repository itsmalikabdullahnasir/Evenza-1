import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password - Evenza",
  description: "Reset your Evenza account password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-12 md:py-16">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
