import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

// Webhook to handle payment confirmations from Dodo Payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get('x-dodo-signature')
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const eventType = body.event_type || body.type
    
    // Handle different event types
    if (eventType === 'payment.succeeded' || eventType === 'payment_intent.succeeded') {
      await handlePaymentSuccess(body)
    } else if (eventType === 'subscription.created' || eventType === 'customer.subscription.created') {
      await handleSubscriptionCreated(body)
    } else if (eventType === 'subscription.updated' || eventType === 'customer.subscription.updated') {
      await handleSubscriptionUpdated(body)
    } else {
      console.log('Unhandled event type:', eventType)
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

  // If it's a one-time purchase (Credit Pack), add credits to the user's balance
  if (paymentType === 'one-time') {
    const creditsToAdd = 10 // Credit Pack gives 10 credits
    
    // Get current user to find existing credits
    const user = await usersCollection.findOne({ email: customerEmail })
    const currentCredits = user?.totalCredits || 0
    
    updateData.totalCredits = currentCredits + creditsToAdd
    console.log(`Adding ${creditsToAdd} credits. Previous: ${currentCredits}, New: ${currentCredits + creditsToAdd}`)
  }

  // Update user record
  const updateResult = await usersCollection.updateOne(
    { email: customerEmail },
    { $set: updateData },
    { upsert: false } // Don't create if user doesn't exist
  )

  console.log('User payment status updated:', {
    email: customerEmail,
    paymentType,
    matched: updateResult.matchedCount,
    modified: updateResult.modifiedCount,
    creditsAdded: paymentType === 'one-time' ? updateData.totalCredits : undefined,
  })
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
    },
    { upsert: false }
  )

  console.log('User subscription created:', {
    email: customerEmail,
    paymentType,
    subscriptionId: data.subscription_id || data.id,
  })
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
    },
    { upsert: false }
  )

  console.log('User subscription updated:', {
    email: customerEmail,
    status,
  })
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

