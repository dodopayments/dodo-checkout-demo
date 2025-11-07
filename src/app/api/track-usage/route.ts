import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'
import type { Collection, UpdateFilter } from 'mongodb'

type UserDoc = {
  email: string
  paymentType?: 'usage-based' | 'one-time' | 'subscription'
  paymentMetadata?: {
    plan?: string
    billing_frequency?: string
    billing_type?: string
    [key: string]: unknown
  }
  imagesGenerated?: number
  totalUsageCost?: number
  lastImageGenerated?: Date
  lastActivityDate?: Date
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection: Collection<UserDoc> = db.collection('users')

    // Find user
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate cost based on payment type
    // Only track usage cost for usage-based plans
    const metadata = user.paymentMetadata || {}
    const plan = metadata.plan
    const billingType = metadata.billing_type
    const billingFrequency = metadata.billing_frequency
    
    // Determine if plan is usage-based
    // Don't count totalUsageCost for subscription plans like "Unlimited Pro"
    // If plan is "Unlimited Pro" or has billing_frequency (monthly/annual), it's a subscription, not usage-based
    const isSubscriptionPlan = plan === 'Unlimited Pro' || billingFrequency === 'monthly' || billingFrequency === 'annual'
    const isUsageBased = 
      !isSubscriptionPlan && (
        billingType === 'usage_based' || 
        plan === 'Pay Per Image' ||
        (user.paymentType === 'usage-based' && !isSubscriptionPlan)
      )
    
    let cost = 0
    if (isUsageBased) {
      cost = 0.75 // Pay per image
    }

    // We no longer store per-image usageHistory to avoid duplication

    // Initialize usage stats if they don't exist
    const currentImagesGenerated = user.imagesGenerated || 0
    const currentTotalCost = user.totalUsageCost || 0

    // Update user with new usage data
    // Only update totalUsageCost for usage-based plans
    const updateDoc: UpdateFilter<UserDoc> = {
      $set: {
        imagesGenerated: currentImagesGenerated + 1,
        lastImageGenerated: new Date(),
        lastActivityDate: new Date(),
        ...(isUsageBased && {
          totalUsageCost: Number((currentTotalCost + cost).toFixed(2)),
        }),
      },
    }
    await usersCollection.updateOne({ email }, updateDoc)

    // Fetch updated user data
    const updatedUser = await usersCollection.findOne({ email })

    return NextResponse.json({
      success: true,
      usage: {
        imagesGenerated: updatedUser?.imagesGenerated || 0,
        totalUsageCost: updatedUser?.totalUsageCost || 0,
        lastImageGenerated: updatedUser?.lastImageGenerated,
      },
      message: 'Usage tracked successfully',
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

