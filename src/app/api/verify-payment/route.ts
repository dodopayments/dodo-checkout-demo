import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

/**
 * This endpoint manually verifies payment status with Dodo Payments API
 * Useful for local development where webhooks can't reach localhost
 * Also serves as a fallback if webhook delivery fails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, paymentId, subscriptionId } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const bearerToken = process.env.DODO_PAYMENTS_API_KEY
    if (!bearerToken) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    let paymentData = null
    let paymentType: 'one-time' | 'subscription' | 'usage-based' = 'one-time'

    // If payment ID provided, verify the payment
    if (paymentId) {
      const paymentResponse = await fetch(`https://test.dodopayments.com/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (paymentResponse.ok) {
        paymentData = await paymentResponse.json()
        
        // Check if payment is successful
        if (paymentData.status === 'paid' || paymentData.status === 'succeeded') {
          const metadata = paymentData.metadata || {}
          paymentType = determinePaymentType(metadata, paymentData)

          // Update user in database
          await updateUserPaymentStatus(email, paymentType, paymentId, metadata)

          return NextResponse.json({
            success: true,
            message: 'Payment verified and user updated',
            paymentType,
          })
        } else {
          return NextResponse.json({
            success: false,
            message: `Payment status is ${paymentData.status}, not paid yet`,
          })
        }
      }
    }

    // If subscription ID provided, verify the subscription
    if (subscriptionId) {
      const subscriptionResponse = await fetch(`https://test.dodopayments.com/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        
        // Check if subscription is active
        if (subscriptionData.status === 'active' || subscriptionData.status === 'trialing') {
          const metadata = subscriptionData.metadata || {}
          paymentType = metadata.billing_type === 'usage_based' ? 'usage-based' : 'subscription'

          // Update user in database
          await updateUserPaymentStatus(
            email, 
            paymentType, 
            subscriptionData.payment_id || subscriptionId, 
            metadata,
            subscriptionId,
            subscriptionData.status,
            subscriptionData.customer_id // Pass customer_id for usage-based subscriptions
          )

          return NextResponse.json({
            success: true,
            message: 'Subscription verified and user updated',
            paymentType,
            customerId: subscriptionData.customer_id, // Return customer_id to frontend
          })
        } else {
          return NextResponse.json({
            success: false,
            message: `Subscription status is ${subscriptionData.status}`,
          })
        }
      }
    }

    return NextResponse.json(
      { error: 'Payment ID or Subscription ID required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

type PaymentType = 'one-time' | 'subscription' | 'usage-based'

type UserUpdateData = {
  payment: 'paid' | 'unpaid'
  paymentType: PaymentType
  paymentDate: Date
  lastPaymentId: string
  paymentMetadata: Record<string, string>
  totalCredits?: number
  subscriptionId?: string
  subscriptionStatus?: string
  customerId?: string
}

async function updateUserPaymentStatus(
  email: string,
  paymentType: PaymentType,
  paymentId: string,
  metadata: Record<string, string>,
  subscriptionId?: string,
  subscriptionStatus?: string,
  customerId?: string
) {
  const client = await clientPromise
  const db = client.db()
  const usersCollection = db.collection('users')

  const updateData: UserUpdateData = {
    payment: 'paid',
    paymentType: paymentType,
    paymentDate: new Date(),
    lastPaymentId: paymentId,
    paymentMetadata: metadata,
  }

  if (subscriptionId) {
    updateData.subscriptionId = subscriptionId
    updateData.subscriptionStatus = subscriptionStatus
  }

  if (customerId) {
    updateData.customerId = customerId
  }

  // If it's a one-time purchase (Credit Pack), add credits to the user's balance
  if (paymentType === 'one-time') {
    const creditsToAdd = 10 // Credit Pack gives 10 credits
    
    // Get current user to find existing credits
    const user = await usersCollection.findOne({ email })
    const currentCredits = user?.totalCredits || 0
    
    updateData.totalCredits = currentCredits + creditsToAdd
    console.log(`Adding ${creditsToAdd} credits. Previous: ${currentCredits}, New: ${currentCredits + creditsToAdd}`)
  }

  const result = await usersCollection.updateOne(
    { email },
    { $set: updateData },
    { upsert: false }
  )

  console.log('User payment status updated:', {
    email,
    paymentType,
    matched: result.matchedCount,
    modified: result.modifiedCount,
    creditsAdded: paymentType === 'one-time' ? updateData.totalCredits : undefined,
  })

  return result
}

function determinePaymentType(
  metadata: Record<string, string>,
  data: { subscription_id?: string; subscription?: unknown },
): PaymentType {
  if (metadata.billing_type === 'usage_based') return 'usage-based'
  if (metadata.plan === 'Pay Per Image') return 'usage-based'
  if (metadata.plan === 'Credit Pack') return 'one-time'
  if (metadata.plan === 'Unlimited Pro') return 'subscription'

  if (data.subscription_id || data.subscription) {
    return metadata.billing_type === 'usage_based' ? 'usage-based' : 'subscription'
  }

  return 'one-time'
}

