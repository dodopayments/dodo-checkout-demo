"use client"

export default function DemoBottomPopup() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-up-fade border-b-2 border-lime-200 bg-lime-50 shadow-lg dark:border-lime-800 dark:bg-lime-950/95">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="hidden sm:flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-lime-600 text-white dark:bg-lime-400 dark:text-gray-900">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm md:text-base font-medium text-center text-lime-900 dark:text-lime-100">
            Dodo Payments Demo - Experience usage-based billing, one-time payments, and subscriptions. All payment flows are fully functional.
          </p>
        </div>
      </div>
    </div>
  )
}


