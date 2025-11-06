import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

// Webhook to handle payment confirmations from Dodo Payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const eventType = body.event_type || body.type
    
    // Handle different event types
    if (eventType === 'payment.succeeded' || eventType === 'payment_intent.succeeded') {
      await handlePaymentSuccess(body)
    } else if (eventType === 'subscription.created' || eventType === 'customer.subscription.created') {
      await handleSubscriptionCreated(body)
    } else if (eventType === 'subscription.updated' || eventType === 'customer.subscription.updated') {
      await handleSubscriptionUpdated(body)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

type PaymentWebhookData = {
  event_type?: string
  type?: string
  customer?: { email?: string }
  billing_details?: { email?: string }
  metadata?: Record<string, string>
  payment_id?: string
  id?: string
  subscription_id?: string
  status?: string
  data?: {
    object?: {
      customer_email?: string
      metadata?: Record<string, string>
      id?: string
      subscription?: unknown
      status?: string
    }
  }
}

type PaymentType = 'one-time' | 'subscription' | 'usage-based'

type UserUpdateData = {
  payment: 'paid' | 'unpaid'
  paymentType: PaymentType
  paymentDate?: Date
  lastPaymentId?: string
  paymentMetadata?: Record<string, string>
  totalCredits?: number
  subscriptionId?: string
  subscriptionStatus?: string
  lastUpdated?: Date
}

async function handlePaymentSuccess(data: PaymentWebhookData) {
  const client = await clientPromise
  const db = client.db()
  const usersCollection = db.collection('users')

  // Extract customer email from the webhook data
  const customerEmail = data.customer?.email || data.data?.object?.customer_email || data.billing_details?.email
  
  if (!customerEmail) {
    console.error('No customer email found in webhook data')
    return
  }

  // Determine payment type from metadata
  const metadata = data.metadata || data.data?.object?.metadata || {}
  const paymentType = determinePaymentType(metadata, data)

  // Prepare update data
  const updateData: UserUpdateData = {
    payment: 'paid',
    paymentType: paymentType,
    paymentDate: new Date(),
    lastPaymentId: data.payment_id || data.id || data.data?.object?.id,
    paymentMetadata: metadata,
  }

  // If it's a Credit Pack purchase, add credits to the user's balance
  // Only add credits if this payment hasn't been processed yet (check by payment ID)
  if (paymentType === 'one-time' && (metadata.plan === 'Credit Pack' || typeof metadata.credits !== 'undefined')) {
    const paymentId = data.payment_id || data.id || data.data?.object?.id
    
    // Get current user to check if this payment was already processed
    const user = await usersCollection.findOne({ email: customerEmail })
    
    // Only add credits if this is a new payment (payment ID doesn't match last processed payment)
    if (user?.lastPaymentId !== paymentId) {
      const creditsToAdd = Number(metadata.credits ?? 10)
      const currentCredits = user?.totalCredits || 0
      updateData.totalCredits = currentCredits + creditsToAdd
    }
  }

  // Update user record
  await usersCollection.updateOne(
    { email: customerEmail },
    { $set: updateData, $setOnInsert: { email: customerEmail } },
    { upsert: true }
  )
}

async function handleSubscriptionCreated(data: PaymentWebhookData) {
  const client = await clientPromise
  const db = client.db()
  const usersCollection = db.collection('users')

  const customerEmail = data.customer?.email || data.data?.object?.customer_email
  
  if (!customerEmail) {
    console.error('No customer email found in subscription webhook')
    return
  }

  const metadata = data.metadata || data.data?.object?.metadata || {}
  const billingType = metadata.billing_type || 'subscription'
  
  // Determine if it's usage-based or regular subscription
  const paymentType = billingType === 'usage_based' ? 'usage-based' : 'subscription'

  await usersCollection.updateOne(
    { email: customerEmail },
    {
      $set: {
        payment: 'paid',
        paymentType: paymentType,
        subscriptionId: data.subscription_id || data.id || data.data?.object?.id,
        subscriptionStatus: 'active',
        paymentDate: new Date(),
        paymentMetadata: metadata,
      },
      $setOnInsert: { email: customerEmail },
    },
    { upsert: true }
  )
}

async function handleSubscriptionUpdated(data: PaymentWebhookData) {
  const client = await clientPromise
  const db = client.db()
  const usersCollection = db.collection('users')

  const customerEmail = data.customer?.email || data.data?.object?.customer_email
  const status = data.status || data.data?.object?.status
  
  if (!customerEmail) {
    console.error('No customer email found in subscription update webhook')
    return
  }

  // Update subscription status
  await usersCollection.updateOne(
    { email: customerEmail },
    {
      $set: {
        subscriptionStatus: status,
        payment: status === 'active' || status === 'trialing' ? 'paid' : 'unpaid',
        lastUpdated: new Date(),
      },
      $setOnInsert: { email: customerEmail },
    },
    { upsert: true }
  )
}

function determinePaymentType(
  metadata: Record<string, string>,
  data: PaymentWebhookData,
): PaymentType {
  // Check metadata first
  if (metadata.billing_type === 'usage_based') {
    return 'usage-based'
  }
  
  if (metadata.plan === 'Pay Per Image') {
    return 'usage-based'
  }
  
  if (metadata.plan === 'Credit Pack') {
    return 'one-time'
  }
  
  if (metadata.plan === 'Unlimited Pro') {
    return 'subscription'
  }

  // Check if it's a subscription based on the webhook data structure
  if (data.subscription_id || data.data?.object?.subscription) {
    return metadata.billing_type === 'usage_based' ? 'usage-based' : 'subscription'
  }

  // Default to one-time payment
  return 'one-time'
}

