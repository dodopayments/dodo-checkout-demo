/**
 * React Hook for tracking usage events with Dodo Payments
 * 
 * @example
 * ```tsx
 * function ImageGenerator() {
 *   const { trackUsage, isTracking } = useUsageTracking()
 *   
 *   async function generateImage() {
 *     const image = await generateImageAPI()
 *     
 *     // Track the usage
 *     await trackUsage('image.generation', {
 *       resolution: '1024x1024',
 *       style: 'realistic'
 *     })
 *     
 *     return image
 *   }
 * }
 * ```
 */

import { useState, useCallback } from 'react'

interface UsageMetadata {
  [key: string]: string | number | boolean
}

interface TrackUsageOptions {
  /** Custom event ID (auto-generated if not provided) */
  eventId?: string
  /** Whether to show error alerts to users */
  showErrors?: boolean
}

interface UseUsageTrackingReturn {
  /** Track a usage event */
  trackUsage: (
    eventName: string,
    metadata?: UsageMetadata,
    options?: TrackUsageOptions
  ) => Promise<boolean>
  /** Whether a tracking request is in progress */
  isTracking: boolean
  /** Last error that occurred */
  error: Error | null
}

export function useUsageTracking(customerId?: string): UseUsageTrackingReturn {
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const trackUsage = useCallback(
    async (
      eventName: string,
      metadata: UsageMetadata = {},
      options: TrackUsageOptions = {}
    ): Promise<boolean> => {
      const { eventId, showErrors = false } = options

      // Reset error state
      setError(null)
      setIsTracking(true)

      try {
        // Get customer ID from parameter or session storage
        const customerIdToUse = customerId || sessionStorage.getItem('dodo_customer_id')

        if (!customerIdToUse) {
          throw new Error('Customer ID not found. User may not be subscribed to usage-based plan.')
        }

        const response = await fetch('/api/send-usage-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_id: customerIdToUse,
            event_name: eventName,
            event_id: eventId,
            metadata,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to track usage')
        }

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error tracking usage')
        setError(error)
        
        if (showErrors) {
          console.error('Usage tracking error:', error)
          // Optionally show user-friendly error message
          // alert('Failed to track usage. Please contact support if this persists.')
        }
        
        return false
      } finally {
        setIsTracking(false)
      }
    },
    [customerId]
  )

  return {
    trackUsage,
    isTracking,
    error,
  }
}

/**
 * Higher-order function that wraps an async function to automatically track usage
 * 
 * @example
 * ```tsx
 * const generateImage = withUsageTracking(
 *   async (prompt: string) => {
 *     return await imageAPI.generate(prompt)
 *   },
 *   'image.generation',
 *   (prompt) => ({ prompt_length: prompt.length })
 * )
 * ```
 */
export function withUsageTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  eventName: string,
  getMetadata?: (...args: Parameters<T>) => UsageMetadata
): T {
  return (async (...args: Parameters<T>) => {
    // Execute the original function
    const result = await fn(...args)

    // Track usage after successful execution
    try {
      const customerId = sessionStorage.getItem('dodo_customer_id')
      
      if (!customerId) {
        return result
      }

      const metadata = getMetadata ? getMetadata(...args) : {}

      await fetch('/api/send-usage-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          event_name: eventName,
          metadata,
        }),
      })
    } catch (error) {
      // Silently fail - don't break the user's flow
      console.error('Usage tracking failed:', error)
    }

    return result
  }) as T
}

