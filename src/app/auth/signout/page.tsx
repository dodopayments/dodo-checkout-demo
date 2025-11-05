"use client"

import { Suspense } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"

function SignOutContent() {

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-6 px-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Sign out
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to sign out?
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="secondary"
              type="button"
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignOut() {
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
      <SignOutContent />
    </Suspense>
  )
} 