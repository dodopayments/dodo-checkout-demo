"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Badge } from "@/components/Badge"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import DemoBottomPopup from "@/components/ui/DemoBottomPopup"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const searchParams = useSearchParams()

  // Get the callback URL from query parameters or default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  // If there's a returnTo parameter, use that instead
  const returnTo = searchParams.get("returnTo") || callbackUrl


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("resend", {
        redirect: false,
        email,
        callbackUrl: returnTo
      })

      if (result?.error) {
        setError("Failed to send magic link. Please try again.")
      } else {
        setIsEmailSent(true)
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: returnTo,
        redirect: true
      })
    } catch {
      setError("Failed to sign in with Google. Please try again.")
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
            {isEmailSent
              ? "Check your email for a magic link to sign in"
              : "Enter your email to receive a magic link"}
          </p>
        </div>

        <div className="grid gap-6">
          {!isEmailSent ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                )}
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send magic link
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-md bg-sky-50 p-4 dark:bg-sky-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-sky-800 dark:text-sky-200">
                    Magic link sent
                  </h3>
                  <div className="mt-2 text-sm text-sky-700 dark:text-sky-300">
                    <p>
                      We&#39;ve sent a magic link to <span className="font-medium">{email}</span>.
                      Click the link in the email to sign in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="secondary"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full"
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
              Google
            </Button>
          </div>
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