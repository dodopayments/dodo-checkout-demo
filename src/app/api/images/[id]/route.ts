import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

// DELETE /api/images/[id]?email=...
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const { id: imageId } = await context.params

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!imageId) {
      return NextResponse.json({ error: 'Image id is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection('users')

    // Pull from embedded arrays within the user document
    const updateResult = await usersCollection.updateOne(
      { email },
      ({
        $pull: {
          images: { imageId },
        },
        $set: { lastActivityDate: new Date() },
      } as any)
    )

    // If not found by email, try without email (rare fallback)
    let success = updateResult.modifiedCount >= 1
    if (!success) {
      const fallbackResult = await usersCollection.updateMany(
        {},
        ({
          $pull: {
            images: { imageId },
          },
        } as any)
      )
      success = (fallbackResult.modifiedCount || 0) >= 1
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error('DELETE /api/images/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


