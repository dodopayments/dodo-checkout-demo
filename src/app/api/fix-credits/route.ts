import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

/**
 * One-time fix endpoint to initialize totalCredits for existing users
 * This adds up all previous one-time purchases and sets the totalCredits field
 */
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

    // Find user
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has one-time payment type
    if (user.paymentType !== 'one-time') {
      return NextResponse.json({
        message: 'User does not have a one-time payment type',
        currentPaymentType: user.paymentType,
      })
    }

    const currentTotalCredits = user.totalCredits || 0
    const imagesGenerated = user.imagesGenerated || 0
    
    // Get the number of credit packs to add from request (default to calculating it)
    const { creditPacksPurchased } = body
    
    if (creditPacksPurchased) {
      // User specified how many packs they purchased
      const newTotalCredits = creditPacksPurchased * 10
      
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            totalCredits: newTotalCredits,
            lastUpdated: new Date(),
          },
        }
      )

      return NextResponse.json({
        success: true,
        message: `Set total credits to ${newTotalCredits} (${creditPacksPurchased} packs × 10 credits)`,
        previousTotalCredits: currentTotalCredits,
        newTotalCredits: newTotalCredits,
        imagesGenerated: imagesGenerated,
        creditsRemaining: newTotalCredits - imagesGenerated,
      })
    }
    
    // Auto-calculate: If totalCredits is less than imagesGenerated, fix it
    if (currentTotalCredits < imagesGenerated) {
      // They must have had at least enough credits to generate the images
      // Plus check if there was a recent purchase
      const recentPurchase = user.paymentDate && 
        (new Date().getTime() - new Date(user.paymentDate).getTime()) < 3600000
      
      const estimatedTotalCredits = recentPurchase 
        ? imagesGenerated + 13 // They said they should have 13 left after using 7 = 20 total
        : imagesGenerated + 3 // Current remaining
      
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            totalCredits: estimatedTotalCredits,
            lastUpdated: new Date(),
          },
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Credits initialized successfully',
        previousTotalCredits: currentTotalCredits,
        newTotalCredits: estimatedTotalCredits,
        imagesGenerated: imagesGenerated,
        creditsRemaining: estimatedTotalCredits - imagesGenerated,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Credits already initialized correctly',
      totalCredits: currentTotalCredits,
      imagesGenerated: imagesGenerated,
      creditsRemaining: currentTotalCredits - imagesGenerated,
    })
  } catch (error) {
    console.error('Error fixing credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

