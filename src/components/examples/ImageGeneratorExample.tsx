/**
 * Example Component: Image Generator with Usage-Based Billing
 * 
 * This component demonstrates how to integrate usage-based billing
 * into your application using the useUsageTracking hook.
 * 
 * Usage:
 * 1. User subscribes to "Pay Per Image" plan
 * 2. customer_id is stored in session/database
 * 3. Each image generation triggers a usage event
 * 4. Dodo Payments automatically bills the customer
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUsageTracking } from '@/hooks/useUsageTracking'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: Date
}

export function ImageGeneratorExample() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Initialize usage tracking hook
  const { trackUsage, isTracking, error } = useUsageTracking()

  const generateImage = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a prompt')
      return
    }
    setErrorMessage(null)

    setIsGenerating(true)

    try {
      // Step 1: Generate the image (replace with your actual API)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Image generation failed')
      }

      const data = await response.json()
      
      // Step 2: Track usage with Dodo Payments
      const tracked = await trackUsage('image.generation', {
        prompt: prompt.substring(0, 100), // First 100 chars
        resolution: '1024x1024',
        style: 'standard',
        model: 'stable-diffusion',
        generation_time: data.generationTime || 3.5,
      })

      if (!tracked) {
        console.error('Failed to track usage, but image was generated')
        // You can decide whether to still show the image or not
      }

      // Step 3: Add image to the list
      const newImage: GeneratedImage = {
        id: data.id,
        url: data.url,
        prompt,
        timestamp: new Date(),
      }
      
      setImages((prev) => [newImage, ...prev])
      setPrompt('') // Clear prompt after successful generation
      
    } catch (err) {
      console.error('Error generating image:', err)
      setErrorMessage('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          AI Image Generator
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Generate amazing images with AI. You&apos;re charged $0.75 per image.
        </p>

        {/* Error Display */}
        {(error || errorMessage) && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">
              {errorMessage ? (
                <>⚠️ {errorMessage}</>
              ) : (
                <>⚠️ Usage tracking error: {error!.message}</>
              )}
            </p>
          </div>
        )}

        {/* Input Form */}
        <div className="mt-6">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-900 dark:text-gray-50"
          >
            Image Prompt
          </label>
          <div className="mt-2 flex gap-3">
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene landscape with mountains and a lake..."
              className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-500"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateImage()
                }
              }}
            />
            <button
              onClick={generateImage}
              disabled={isGenerating || isTracking}
              className="inline-flex items-center rounded-md bg-lime-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-500 dark:hover:bg-lime-400"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          {isTracking && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Tracking usage...
            </p>
          )}
        </div>

        {/* Generated Images Grid */}
        {images.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Your Images ({images.length})
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
                >
                  <Image
                    src={image.url}
                    alt={image.prompt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
<<<<<<< HEAD
<<<<<<< HEAD
                    className="object-cover"
=======
                    className="h-64 w-full object-cover"
                    unoptimized
>>>>>>> cfcd3e1 (Refactor MongoDB usage and improve type safety)
=======
                    className="object-cover"
>>>>>>> 027a8e4 (Update ImageGeneratorExample.tsx)
                  />
                  <div className="p-3">
                    <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                      {image.prompt}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {image.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isGenerating && (
          <div className="mt-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No images generated yet. Enter a prompt above to get started!
            </p>
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Usage-Based Billing Active
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Each image generation is tracked and you&apos;ll be billed $0.75 per image at the end of your billing cycle.
                View your usage and billing details in your <a href="/dashboard" className="font-medium underline">dashboard</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

