'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/Button'
import DemoBottomPopup from '@/components/ui/DemoBottomPopup'
import Link from 'next/link'

function GuestDashboardContent() {
  const searchParams = useSearchParams()

  const email = searchParams.get('email')
  const status = searchParams.get('status')
  const subscriptionId = searchParams.get('subscription_id')
  const paymentId = searchParams.get('payment_id')

  const planType = subscriptionId ? 'Subscription' : 'One-Time Payment'
  const referenceId = subscriptionId || paymentId || 'N/A'
  const isSuccess = status === 'active' || status === 'paid' || status === 'succeeded' || status === 'trialing' || status === 'completed'

  return (
    <>
      <DemoBottomPopup />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-36">
        <div className="w-full max-w-lg space-y-6">
          {/* Success/Status Banner */}
          <div className="text-center">
            {isSuccess ? (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/30">
                <svg className="h-8 w-8 text-lime-600 dark:text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50">
              {isSuccess ? 'Payment Successful' : 'Payment Processing'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isSuccess
                ? 'Your purchase has been confirmed. Here are your details.'
                : 'Your payment is being processed. Please check back shortly.'}
            </p>
          </div>

          {/* Payment Summary Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Payment Summary
            </h2>
            <dl className="mt-4 space-y-3">
              {email && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600 dark:text-gray-400">Email</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-50">{email}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Plan Type</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-50">{planType}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Status</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    isSuccess
                      ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {status || 'Unknown'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Reference ID</dt>
                <dd className="font-mono text-xs text-gray-900 dark:text-gray-50">{referenceId}</dd>
              </div>
            </dl>
          </div>

          {/* Next Steps Card */}
          <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Next Steps
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your purchase is linked to <strong>{email || 'your email'}</strong>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sign in with the same email to access your full dashboard
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Generate images, track credits, and manage your account from the dashboard
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">
                Sign in to Dashboard
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/pricing">
                Back to Pricing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function GuestDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <GuestDashboardContent />
    </Suspense>
  )
}
