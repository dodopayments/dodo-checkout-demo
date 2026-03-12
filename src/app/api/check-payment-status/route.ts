import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

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
    const usersCollection = db.collection('users')

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json({
        hasPaid: false,
        message: 'User not found',
      })
    }

    // Check if user has paid
    const hasPaid = user.payment === 'paid'

    // Derive payment type dynamically (do not rely on stored paymentType)
    let derivedPaymentType: 'one-time' | 'subscription' | 'usage-based' | 'credit-based' | 'prepaid-credits' | undefined
    type PaymentMetadata = {
      plan?: string
      billing_type?: 'usage_based' | 'subscription' | string
      credits?: number | string
      [key: string]: unknown
    }
    const metadata = (user.paymentMetadata || {}) as PaymentMetadata
    const plan = metadata.plan
    const billingType = metadata.billing_type
    const subStatus = user.subscriptionStatus as string | undefined

    if (billingType === 'credit_based' || plan === 'Credit Pack') {
      derivedPaymentType = 'credit-based'
    } else if (plan === 'Starter Credits') {
      derivedPaymentType = 'prepaid-credits'
    } else if (billingType === 'usage_based' || plan === 'Pay Per Image' || plan === 'Pay As You Go') {
      derivedPaymentType = 'usage-based'
    } else if (plan === 'One-Time Payment' || plan === 'Special Downloads') {
      derivedPaymentType = 'one-time'
    } else if (subStatus === 'active' || subStatus === 'trialing' || plan === 'Unlimited Pro' || billingType === 'subscription') {
      derivedPaymentType = 'subscription'
    } else if (typeof metadata.credits !== 'undefined') {
      derivedPaymentType = 'prepaid-credits'
    }

    return NextResponse.json({
      hasPaid,
      paymentType: derivedPaymentType,
      paymentMetadata: metadata,
      subscriptionStatus: user.subscriptionStatus,
      paymentDate: user.paymentDate,
      customerId: user.customerId,
      dodoCustomerId: user.dodoCustomerId,
      // Usage statistics
      imagesGenerated: user.imagesGenerated || 0,
      totalUsageCost: user.totalUsageCost || 0,
      lastImageGenerated: user.lastImageGenerated,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

