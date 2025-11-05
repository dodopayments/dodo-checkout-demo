import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

// GET /api/images?email=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json({ images: [] })
    }

    const images = Array.isArray(user.images) ? user.images : []

    // Ensure newest first
    images.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ images })
  } catch (error) {
    console.error('GET /api/images error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/images
// body: { email, image: { id, url, prompt, timestamp, resolution, style } }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, image } = body || {}

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!image?.id || !image?.url) {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const imageDoc = {
      imageId: image.id,
      url: image.url,
      prompt: image.prompt || '',
      resolution: image.resolution || '1024x1024',
      style: image.style || 'standard',
      createdAt: image.timestamp ? new Date(image.timestamp) : new Date(),
    }

    const result = await usersCollection.updateOne(
      { email },
      ({
        $push: { images: imageDoc },
        $set: { lastActivityDate: new Date() },
      } as any)
    )

    return NextResponse.json({ success: result.modifiedCount === 1 })
  } catch (error) {
    console.error('POST /api/images error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// DELETE /api/images?email=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection('users')

    const result = await usersCollection.updateOne(
      { email },
      ({
        $set: { images: [], lastActivityDate: new Date() },
      } as any)
    )

    const success = result.matchedCount >= 1
    return NextResponse.json({ success })
  } catch (error) {
    console.error('DELETE /api/images error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


