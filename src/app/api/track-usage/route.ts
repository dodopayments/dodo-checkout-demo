import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'
import type { Collection, UpdateFilter } from 'mongodb'

type UserDoc = {
  email: string
  paymentType?: 'usage-based' | 'one-time' | 'subscription'
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
    let cost = 0
    const paymentType = user.paymentType || 'usage-based'

    if (paymentType === 'usage-based') {
      cost = 0.75 // Pay per image
    } else if (paymentType === 'one-time') {
      cost = 0.70 // Credit pack ($7 for 10 images)
    } else if (paymentType === 'subscription') {
      cost = 0 // Unlimited
    }

    // We no longer store per-image usageHistory to avoid duplication

    // Initialize usage stats if they don't exist
    const currentImagesGenerated = user.imagesGenerated || 0
    const currentTotalCost = user.totalUsageCost || 0

    // Update user with new usage data
    const updateDoc: UpdateFilter<UserDoc> = {
      $set: {
        imagesGenerated: currentImagesGenerated + 1,
        totalUsageCost: Number((currentTotalCost + cost).toFixed(2)),
        lastImageGenerated: new Date(),
        lastActivityDate: new Date(),
      },
    }
    const updateResult = await usersCollection.updateOne({ email }, updateDoc)

    if (updateResult.modifiedCount === 0) {
      console.warn('No documents were modified')
    }

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

