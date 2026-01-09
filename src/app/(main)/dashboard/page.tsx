'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { Button } from '@/components/Button'
import DemoBottomPopup from '@/components/ui/DemoBottomPopup'
import Image from 'next/image'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: Date
  resolution: string
  style: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'settings'>('generate')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<{
    hasPaid: boolean
    paymentType?: string
    loading: boolean
  }>({ hasPaid: false, loading: true })

  const [usageStats, setUsageStats] = useState<{
    imagesGenerated: number
    totalUsageCost: number
    lastImageGenerated?: Date
    totalCredits: number
  }>({
    imagesGenerated: 0,
    totalUsageCost: 0,
    totalCredits: 0,
  })

  // Plan-specific configuration
  const getPlanConfig = () => {
    const type = paymentStatus.paymentType

    if (type === 'usage-based') {
      return {
        name: 'Pay Per Image',
        displayName: 'Pay Per Image (Usage-Based)',
        costPerImage: 0.75,
        showUsageCost: true,
        showCredits: false,
        isUnlimited: false,
        billingMessage: 'Each image generation costs $0.75. You\'ll be billed at the end of your billing cycle.',
        upgradeMessage: 'Need unlimited? Check out our Unlimited Pro plan.'
      }
    } else if (type === 'one-time') {
      return {
        name: 'Credit Pack',
        displayName: 'Credit Pack (One-Time)',
        costPerImage: 0.70, // $7 for 10 images
        showUsageCost: false,
        showCredits: true,
        creditsTotal: usageStats.totalCredits || 10, // Use actual total credits from purchases
        isUnlimited: false,
        billingMessage: `You have ${Math.max(0, (usageStats.totalCredits || 10) - usageStats.imagesGenerated)} credits remaining.`,
        upgradeMessage: 'Running low? Purchase another pack or upgrade to Unlimited Pro.'
      }
    } else if (type === 'subscription') {
      return {
        name: 'Unlimited Pro',
        displayName: 'Unlimited Pro (Subscription)',
        costPerImage: 0,
        showUsageCost: false,
        showCredits: false,
        isUnlimited: true,
        billingMessage: 'You have unlimited image generation with your Pro subscription.',
        upgradeMessage: null
      }
    } else {
      // Default to usage-based
      return {
        name: 'Pay Per Image',
        displayName: 'Pay Per Image (Usage-Based)',
        costPerImage: 0.75,
        showUsageCost: true,
        showCredits: false,
        isUnlimited: false,
        billingMessage: 'Each image generation costs $0.75. You\'ll be billed at the end of your billing cycle.',
        upgradeMessage: 'Need unlimited? Check out our Unlimited Pro plan.'
      }
    }
  }

  const planConfig = getPlanConfig()

  // Usage tracking
  const { trackUsage, isTracking } = useUsageTracking()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Check payment status and verify if coming from payment
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!session?.user?.email) {
        return
      }

      try {
        // Check URL params for payment/subscription success
        const urlParams = new URLSearchParams(window.location.search)
        const paymentSuccess = urlParams.get('payment') === 'success'
        const subscriptionSuccess = urlParams.get('subscription') === 'success'

        // Get stored payment/subscription IDs from localStorage
        const storedPaymentId = localStorage.getItem('pending_payment_id')
        const storedSubscriptionId = localStorage.getItem('pending_subscription_id')
        const storedSessionId = localStorage.getItem('pending_checkout_session_id')

        // If coming back from payment, verify it first
        if ((paymentSuccess || subscriptionSuccess) && (storedPaymentId || storedSubscriptionId)) {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              paymentId: storedPaymentId,
              subscriptionId: storedSubscriptionId,
            }),
          })

          const verifyData = await verifyResponse.json()

          // Store customer ID for usage tracking if available
          if (verifyData.customerId) {
            sessionStorage.setItem('dodo_customer_id', verifyData.customerId)
          }

          // Clear stored IDs
          localStorage.removeItem('pending_payment_id')
          localStorage.removeItem('pending_subscription_id')

          // Clean URL
          window.history.replaceState({}, '', '/dashboard')
        }

        // If we have a pending checkout session (overlay or redirect), verify it immediately
        if (storedSessionId) {
          const verifySessionResp = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              sessionId: storedSessionId,
            }),
          })
          const verifySessionData = await verifySessionResp.json().catch(() => ({}))
          if (verifySessionData?.customerId) {
            sessionStorage.setItem('dodo_customer_id', verifySessionData.customerId)
          }
          localStorage.removeItem('pending_checkout_session_id')
        }

        // Now check payment status
        const response = await fetch('/api/check-payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
          }),
        })

        const data = await response.json()

        setPaymentStatus({
          hasPaid: data.hasPaid || false,
          paymentType: data.paymentType,
          loading: false,
        })

        // Load usage statistics from database
        setUsageStats({
          imagesGenerated: data.imagesGenerated || 0,
          totalUsageCost: data.totalUsageCost || 0,
          lastImageGenerated: data.lastImageGenerated ? new Date(data.lastImageGenerated) : undefined,
          totalCredits: data.totalCredits || 0,
        })

        // Store customer ID for usage tracking if available
        if (data.customerId) {
          sessionStorage.setItem('dodo_customer_id', data.customerId)
        }

        // Redirect to pricing if not paid
        if (!data.hasPaid) {
          router.push('/pricing?error=payment_required')
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setPaymentStatus({ hasPaid: false, loading: false })
      }
    }

    if (status === 'authenticated') {
      checkPaymentStatus()
    }
  }, [session?.user?.email, status, router])

  // Load images from database for this user
  useEffect(() => {
    const loadImages = async () => {
      if (!session?.user?.email) return
      try {
        const res = await fetch(`/api/images?email=${encodeURIComponent(session.user.email)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data.images)) {
          type ApiImageDoc = {
            imageId: string
            url: string
            prompt?: string
            createdAt: string | Date
            resolution?: string
            style?: string
          }
          const mapped = (data.images as ApiImageDoc[]).map((doc: ApiImageDoc) => ({
            id: doc.imageId,
            url: doc.url,
            prompt: doc.prompt || '',
            timestamp: new Date(doc.createdAt),
            resolution: doc.resolution || '1024x1024',
            style: doc.style || 'standard',
          }))
          setImages(mapped)
        }
      } catch (e) {
        console.error('Failed to load images from database', e)
      }
    }
    loadImages()
  }, [session?.user?.email])

  const generateImage = async () => {
    if (!prompt.trim()) {
      setFormError('Please enter a prompt')
      return
    }
    setFormError(null)

    setIsGenerating(true)

    try {
      // Determine max resolution based on plan
      const getPlanResolution = () => {
        const type = paymentStatus.paymentType
        if (type === 'subscription') {
          return { width: 4096, height: 4096, label: '4096x4096' }
        }
        if (type === 'one-time') {
          return { width: 2048, height: 2048, label: '2048x2048' }
        }
        // Default and usage-based
        return { width: 1024, height: 1024, label: '1024x1024' }
      }
      const res = getPlanResolution()
      // Simulate image generation (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate a placeholder image URL using picsum.photos
      const imageId = Math.floor(Math.random() * 1000)
      const imageUrl = `https://picsum.photos/seed/${imageId}/${res.width}/${res.height}`

      const newImage: GeneratedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date(),
        resolution: res.label,
        style: 'standard',
      }

      // Save usage to database
      try {
        if (!session?.user?.email) {
          throw new Error('User session not found')
        }

        const trackResponse = await fetch('/api/track-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            imageData: {
              imageId: newImage.id,
              prompt: prompt.substring(0, 100),
              resolution: res.label,
              style: 'standard',
            },
          }),
        })

        const trackData = await trackResponse.json()

        if (trackData.success) {
          // Update usage stats from database response
          setUsageStats(prev => ({
            imagesGenerated: trackData.usage.imagesGenerated,
            totalUsageCost: trackData.usage.totalUsageCost,
            lastImageGenerated: new Date(trackData.usage.lastImageGenerated),
            totalCredits: prev.totalCredits, // Keep existing totalCredits
          }))
        }
      } catch (err) {
        console.error('Error tracking usage in database:', err)
      }

      // Track usage with Dodo Payments (only for usage-based plans)
      if (planConfig.name === 'Pay Per Image' && paymentStatus.paymentType === 'usage-based') {
        const tracked = await trackUsage('image.generation', {
          prompt: prompt.substring(0, 100),
          resolution: res.label,
          style: 'standard',
          model: 'stable-diffusion',
        })

        if (!tracked) {
          // Failed to track usage with Dodo Payments, but image was generated
        }
      }

      setImages(prev => [newImage, ...prev])
      setPrompt('')

      // Persist image to database
      try {
        if (session?.user?.email) {
          await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email, image: newImage }),
          })
        }
      } catch (e) {
        console.error('Failed to save image to database', e)
      }

      // Show success notification
      setNotification({ type: 'success', message: 'Image generated successfully! 🎉' })
      setTimeout(() => setNotification(null), 3000)

    } catch (err) {
      console.error('Error generating image:', err)
      setNotification({ type: 'error', message: 'Failed to generate image. Please try again.' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      if (session?.user?.email) {
        const res = await fetch(`/api/images/${encodeURIComponent(id)}?email=${encodeURIComponent(session.user.email)}`, {
          method: 'DELETE',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.success === false) {
          // Server failed to delete image
        }
      }
    } catch (e) {
      console.error('Failed to delete image from database', e)
    } finally {
      // Optimistic update
      setImages(prev => prev.filter(img => img.id !== id))
      if (selectedImage?.id === id) {
        setSelectedImage(null)
      }
      // Sync with DB
      try {
        if (session?.user?.email) {
          const res = await fetch(`/api/images?email=${encodeURIComponent(session.user.email)}`)
          const data = await res.json()
          if (res.ok && Array.isArray(data.images)) {
            type ApiImageDoc = {
              imageId: string
              url: string
              prompt?: string
              createdAt: string | Date
              resolution?: string
              style?: string
            }
            const mapped = (data.images as ApiImageDoc[]).map((doc: ApiImageDoc) => ({
              id: doc.imageId,
              url: doc.url,
              prompt: doc.prompt || '',
              timestamp: new Date(doc.createdAt),
              resolution: doc.resolution || '1024x1024',
              style: doc.style || 'standard',
            }))
            setImages(mapped)
          }
        }
      } catch {
        // ignore
      }
    }
  }

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `${image.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === 'loading' || paymentStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Show payment required message if user hasn't paid
  if (!paymentStatus.hasPaid) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please subscribe to a plan to access the dashboard and start generating images.
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              View Pricing Plans
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl border-2 p-4 shadow-lg ${notification.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/90' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/90'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.type === 'success' ? 'bg-green-600 text-white dark:bg-green-400 dark:text-gray-900' : 'bg-red-600 text-white dark:bg-red-400 dark:text-gray-900'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {notification.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <div className="flex-1">
              <p className={`${notification.type === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'} text-sm`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <DemoBottomPopup />
      <div className="flex flex-col overflow-hidden px-3 pt-20"></div>
      <div className="min-h-screen bg-white dark:bg-gray-950 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Demo Notice Banner */}
          <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  <strong>Demo Mode:</strong> This is just for demonstration purposes. Images are generated using placeholder content to showcase the payment integration and usage-based billing features.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Image Generator
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back, {session.user?.name || session.user?.email}!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Images
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usageStats.imagesGenerated}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {planConfig.showCredits ? 'Credits Left' : planConfig.isUnlimited ? 'Plan Status' : 'Usage Cost'}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                        {planConfig.isUnlimited ? (
                          <span className="text-lg">Unlimited</span>
                        ) : planConfig.showCredits ? (
                          `${Math.max(0, (planConfig.creditsTotal || 10) - usageStats.imagesGenerated)} / ${planConfig.creditsTotal || 10}`
                        ) : (
                          `$${usageStats.totalUsageCost.toFixed(2)}`
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        This Month
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usageStats.imagesGenerated}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Status
                      </dt>
                      <dd className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Active
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('generate')}
                className={`${activeTab === 'generate'
                  ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`${activeTab === 'gallery'
                  ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Gallery ({images.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${activeTab === 'settings'
                  ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-6">

              {/* Low Credits Warning */}
              {planConfig.showCredits && (
                <>
                  {usageStats.imagesGenerated >= usageStats.totalCredits && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                            No Credits Remaining
                          </h3>
                          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                            You&apos;ve used all {usageStats.totalCredits} credits. Purchase more credits or upgrade to unlimited generation.
                          </p>
                          <div className="mt-3">
                            <Button
                              onClick={() => router.push('/pricing')}
                              variant="secondary"
                              className="text-sm"
                            >
                              View Plans
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {usageStats.imagesGenerated >= usageStats.totalCredits - 2 && usageStats.imagesGenerated < usageStats.totalCredits && (
                    <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                            Low Credits Warning
                          </h3>
                          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                            You only have {Math.max(0, usageStats.totalCredits - usageStats.imagesGenerated)} credit{Math.max(0, usageStats.totalCredits - usageStats.imagesGenerated) !== 1 ? 's' : ''} remaining. Consider purchasing more or upgrading to unlimited.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Info Banner */}
              <div className={`rounded-lg p-4 border ${planConfig.isUnlimited
                  ? 'bg-lime-50 border-lime-200 dark:bg-lime-900/20 dark:border-lime-800'
                  : planConfig.showCredits
                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${planConfig.isUnlimited
                        ? 'text-lime-400'
                        : planConfig.showCredits
                          ? 'text-purple-400'
                          : 'text-blue-400'
                      }`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${planConfig.isUnlimited
                        ? 'text-lime-800 dark:text-lime-400'
                        : planConfig.showCredits
                          ? 'text-purple-800 dark:text-purple-400'
                          : 'text-blue-800 dark:text-blue-400'
                      }`}>
                      {planConfig.name}
                    </h3>
                    <p className={`mt-1 text-sm ${planConfig.isUnlimited
                        ? 'text-lime-700 dark:text-lime-300'
                        : planConfig.showCredits
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                      {planConfig.billingMessage}
                      {planConfig.upgradeMessage && (
                        <> {planConfig.upgradeMessage.includes('Unlimited Pro') ? (
                          <>Check out our <a href="/pricing" className="font-medium underline">Unlimited Pro plan</a>.</>
                        ) : (
                          <a href="/pricing" className="font-medium underline">{planConfig.upgradeMessage}</a>
                        )}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generator Form */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Generate New Image
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Prompt
                    </label>
                    <textarea
                      id="prompt"
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate... e.g., 'A serene mountain landscape at sunset with a crystal-clear lake reflecting the orange sky'"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                      disabled={isGenerating}
                    />
                  {formError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formError}</p>
                  )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {isTracking && planConfig.name === 'Pay Per Image' && <span className="text-yellow-600 dark:text-yellow-400">⏳ Tracking usage...</span>}
                    </div>
                    <Button
                      onClick={generateImage}
                      disabled={isGenerating || (isTracking && planConfig.name === 'Pay Per Image') || !prompt.trim() || (planConfig.showCredits && usageStats.imagesGenerated >= usageStats.totalCredits)}
                      className="px-6 py-3"
                    >
                      {isGenerating ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </>
                      ) : planConfig.showCredits && usageStats.imagesGenerated >= usageStats.totalCredits ? (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          No Credits Left
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {planConfig.isUnlimited ? 'Generate Image' : planConfig.showCredits ? 'Use 1 Credit' : `Generate Image ($${planConfig.costPerImage.toFixed(2)})`}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Images Preview */}
              {images.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recently Generated
                    </h3>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="text-sm text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:text-lime-300 font-medium"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.slice(0, 4).map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-lime-500 dark:hover:border-lime-400 transition-colors"
                        onClick={() => {
                          setSelectedImage(image)
                          setActiveTab('gallery')
                        }}
                      >
                        <Image
                          src={image.url}
                          alt={image.prompt}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {images.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No images yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Generate your first AI image to get started!
                  </p>
                  <Button
                    onClick={() => setActiveTab('generate')}
                    className="mt-6"
                  >
                    Start Generating
                  </Button>
                </div>
              ) : selectedImage ? (
                // Image Detail View
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to gallery
                  </button>

                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-900">
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.prompt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 800px"
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Prompt
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {selectedImage.prompt}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Resolution</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImage.resolution}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Style</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImage.style}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedImage.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Cost</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {planConfig.isUnlimited ? 'Free' : planConfig.showCredits ? '1 Credit' : `$${planConfig.costPerImage.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => downloadImage(selectedImage)}
                          className="flex-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </Button>
                        <button
                          onClick={() => deleteImage(selectedImage.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Gallery Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <Image
                          src={image.url}
                          alt={image.prompt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {image.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadImage(image)
                          }}
                          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session.user?.name || 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session.user?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {planConfig.displayName}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Billing Info */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Billing Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {planConfig.isUnlimited ? 'Unlimited Plan' : planConfig.showCredits ? 'Credits Used' : 'Current Usage'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {planConfig.isUnlimited ? 'Unlimited images' : `${usageStats.imagesGenerated} ${planConfig.showCredits ? `/ ${usageStats.totalCredits}` : ''} images generated`}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {planConfig.isUnlimited ?
                        '∞' :
                        planConfig.showCredits ?
                          `${Math.max(0, usageStats.totalCredits - usageStats.imagesGenerated)} left` :
                          `$${usageStats.totalUsageCost.toFixed(2)}`
                      }
                    </span>
                  </div>
                  {!planConfig.isUnlimited && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => router.push('/pricing')}
                        variant="secondary"
                        className="w-full"
                      >
                        {planConfig.showCredits ? 'Buy More Credits or Upgrade' : 'Upgrade to Unlimited Pro'}
                      </Button>
                    </div>
                  )}
                  {planConfig.isUnlimited && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        You&apos;re on our best plan! Enjoy unlimited generation. 🎉
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-red-200 dark:border-red-800 p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to clear all generated images? This cannot be undone.')) return
                      try {
                        if (session?.user?.email) {
                          const res = await fetch(`/api/images?email=${encodeURIComponent(session.user.email)}`, { method: 'DELETE' })
                          const data = await res.json().catch(() => ({}))
                          if (!res.ok || data.success === false) {
                            // Server failed to clear images
                          }
                        }
                      } catch (e) {
                        console.error('Failed to clear images from database', e)
                      } finally {
                        // Optimistic UI
                        setImages([])
                        localStorage.removeItem('generated_images')
                        // Sync from DB
                        try {
                          if (session?.user?.email) {
                            const res = await fetch(`/api/images?email=${encodeURIComponent(session.user.email)}`)
                            const data = await res.json()
                            if (res.ok && Array.isArray(data.images)) {
                              type ApiImageDoc = {
                                imageId: string
                                url: string
                                prompt?: string
                                createdAt: string | Date
                                resolution?: string
                                style?: string
                              }
                              const mapped = (data.images as ApiImageDoc[]).map((doc: ApiImageDoc) => ({
                                id: doc.imageId,
                                url: doc.url,
                                prompt: doc.prompt || '',
                                timestamp: new Date(doc.createdAt),
                                resolution: doc.resolution || '1024x1024',
                                style: doc.style || 'standard',
                              }))
                              setImages(mapped)
                            }
                          }
                        } catch {
                          // ignore
                        }
                        setNotification({ type: 'success', message: 'All images have been cleared.' })
                        setTimeout(() => setNotification(null), 3000)
                      }
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Clear All Images
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
