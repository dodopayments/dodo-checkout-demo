import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

/**
 * This endpoint manually verifies payment status with Dodo Payments API
 * Useful for local development where webhooks can't reach localhost
 * Also serves as a fallback if webhook delivery fails
 */
type VerifyBody = {
  email?: string
  paymentId?: string
  subscriptionId?: string
  sessionId?: string
}
export async function POST(request: NextRequest) {
  try {
    let body: VerifyBody | undefined
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
    const { email, paymentId, subscriptionId, sessionId } = body || {}

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

    // If checkout session ID provided, verify via Checkout Sessions API and map to payment/subscription
    if (sessionId) {
      const sessionResponse = await fetch(`https://test.dodopayments.com/checkouts/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (sessionResponse.ok) {
        const session = await sessionResponse.json()
        const metadata = session?.metadata || {}
        // Prefer explicit fields if present
        const status: string | undefined = session?.status
        const customerEmail: string | undefined = session?.customer?.email || email
        const discoveredPaymentId: string | undefined = session?.payment_id || session?.latest_payment_id
        const discoveredSubscriptionId: string | undefined = session?.subscription_id

        if (!customerEmail) {
          return NextResponse.json({ success: false, message: 'Unable to determine customer email from session' })
        }

        // Determine type using existing helper rules
        const inferredType = determinePaymentType(metadata, {
          subscription_id: discoveredSubscriptionId,
          subscription: session?.subscription_id ? { id: session.subscription_id } : undefined,
        })

        // Accept a wider set of success-like statuses
        const successLike = new Set(['paid', 'succeeded', 'active', 'trialing', 'completed'])
        if (status && successLike.has(status)) {
          await updateUserPaymentStatus(
            customerEmail,
            inferredType,
            discoveredPaymentId || discoveredSubscriptionId || sessionId,
            metadata,
            discoveredSubscriptionId,
            status,
            session?.customer_id || session?.customer?.id,
          )

          return NextResponse.json({ success: true, message: 'Session verified and user updated', paymentType: inferredType })
        }

        // Fallback: if payment_id exists, verify payment directly
        if (discoveredPaymentId) {
          const payResp = await fetch(`https://test.dodopayments.com/payments/${discoveredPaymentId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          })
          if (payResp.ok) {
            const pay = await payResp.json()
            if (pay?.status === 'paid' || pay?.status === 'succeeded') {
              await updateUserPaymentStatus(
                customerEmail,
                inferredType,
                discoveredPaymentId,
                pay?.metadata || metadata,
                discoveredSubscriptionId,
                pay?.status,
                pay?.customer_id,
              )
              return NextResponse.json({ success: true, message: 'Payment verified and user updated', paymentType: inferredType })
            }
          }
        }

        // Fallback: if subscription_id exists, verify subscription directly
        if (discoveredSubscriptionId) {
          const subResp = await fetch(`https://test.dodopayments.com/subscriptions/${discoveredSubscriptionId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          })
          if (subResp.ok) {
            const sub = await subResp.json()
            if (sub?.status === 'active' || sub?.status === 'trialing') {
              await updateUserPaymentStatus(
                customerEmail,
                metadata.billing_type === 'usage_based' ? 'usage-based' : 'subscription',
                sub?.payment_id || discoveredSubscriptionId,
                sub?.metadata || metadata,
                discoveredSubscriptionId,
                sub?.status,
                sub?.customer_id,
              )
              return NextResponse.json({ success: true, message: 'Subscription verified and user updated', paymentType: inferredType })
            }
          }
        }

        // Not successful yet
        return NextResponse.json({ success: false, message: `Session not successful. status=${status || 'unknown'}`, session })
      }
    }

    return NextResponse.json(
      { error: 'Payment ID or Subscription ID or Session ID required' },
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
  paymentType?: PaymentType
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

  // Add credits only for explicit Credit Pack purchases
  // Only add credits if this payment hasn't been processed yet (check by payment ID)
  if (paymentType === 'one-time' && (metadata?.plan === 'Credit Pack' || typeof metadata?.credits !== 'undefined')) {
    const user = await usersCollection.findOne({ email })
    
    // Only add credits if this is a new payment (payment ID doesn't match last processed payment)
    if (user?.lastPaymentId !== paymentId) {
      const creditsToAdd = Number(metadata?.credits ?? 10)
      const currentCredits = user?.totalCredits || 0
      updateData.totalCredits = currentCredits + creditsToAdd
    }
  }

  const result = await usersCollection.updateOne(
    { email },
    { $set: updateData, $setOnInsert: { email } },
    { upsert: true }
  )

  return result
}

function determinePaymentType(
  metadata: Record<string, string>,
  data: { subscription_id?: string; subscription?: unknown },
): PaymentType {
  if (metadata.billing_type === 'usage_based') return 'usage-based'
  if (metadata.billing_type === 'subscription') return 'subscription'
  if (metadata.plan === 'Pay Per Image') return 'usage-based'
  if (metadata.plan === 'Credit Pack') return 'one-time'
  if (metadata.plan === 'Unlimited Pro') return 'subscription'

  if (data.subscription_id || data.subscription) {
    return metadata.billing_type === 'usage_based' ? 'usage-based' : 'subscription'
  }

  return 'one-time'
}

