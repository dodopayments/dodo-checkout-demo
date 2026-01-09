"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import DemoBottomPopup from "@/components/ui/DemoBottomPopup"

function SignInContent() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  // Get the callback URL from query parameters or default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  // If there's a returnTo parameter, use that instead
  const returnTo = searchParams.get("returnTo") || callbackUrl


  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", {
        callbackUrl: returnTo,
        redirect: true
      })
    } catch {
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-40 sm:pt-48 md:pt-56 lg:pt-64 pb-10">
      <div className="mx-auto mt-8 flex w-full max-w-md flex-col space-y-6 px-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in with your Google account to access your dashboard.
          </p>
        </div>
        <div className="grid gap-6">
          {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
          <Button
            variant="secondary"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full"
            isLoading={isLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          By signing in, you agree to our{" "}
          <Link
            target="_blank"
            href="/terms"
            className="underline hover:text-gray-900 dark:hover:text-gray-50"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            target="_blank"
            href="/privacy"
            className="underline hover:text-gray-900 dark:hover:text-gray-50"
          >
            Privacy Policy
          </Link>.
        </p>
      </div>
      <DemoBottomPopup />
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="mx-auto mt-36 flex w-full max-w-md flex-col space-y-6 px-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Badge>Authentication</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Loading...
          </h1>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
} 