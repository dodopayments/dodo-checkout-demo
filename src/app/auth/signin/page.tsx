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
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsEmailLoading(true)
    setError("")
    try {
      const result = await signIn("resend", {
        email,
        callbackUrl: returnTo,
        redirect: false,
      })
      if (result?.error) {
        setError("Failed to send magic link. Please try again.")
      } else {
        setEmailSent(true)
      }
    } catch {
      setError("Failed to send magic link. Please try again.")
    } finally {
      setIsEmailLoading(false)
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
            Sign in to access your dashboard.
          </p>
        </div>
        <div className="grid gap-4">
          {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}

          {/* Email magic link sign-in (uncomment to enable Resend-based email login)
          {emailSent ? (
            <div className="rounded-lg border border-lime-200 bg-lime-50 p-4 text-center dark:border-lime-800 dark:bg-lime-950/30">
              <p className="text-sm font-medium text-lime-800 dark:text-lime-200">
                Magic link sent to {email}
              </p>
              <p className="mt-1 text-xs text-lime-600 dark:text-lime-400">
                Check your inbox and click the link to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="grid gap-3">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-400 dark:focus:border-lime-400 dark:focus:ring-lime-400"
              />
              <Button
                type="submit"
                disabled={isEmailLoading}
                className="w-full"
                isLoading={isEmailLoading}
              >
                Sign in with Email
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                or
              </span>
            </div>
          </div>
          */}

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
