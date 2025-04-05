import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const interests = await prisma.userInterest.findMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ interests })
  } catch (error) {
    console.error("Error fetching user interests:", error)
    return NextResponse.json({ error: "Failed to fetch user interests" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { subject, interestLevel = 5 } = await req.json()

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    // Check if interest already exists
    const existingInterest = await prisma.userInterest.findFirst({
      where: {
        userId: user.id,
        subject
      }
    })

    if (existingInterest) {
      // Update existing interest
      const updatedInterest = await prisma.userInterest.update({
        where: { id: existingInterest.id },
        data: { interestLevel }
      })
      return NextResponse.json({ interest: updatedInterest })
    }

    // Create new interest
    const newInterest = await prisma.userInterest.create({
      data: {
        userId: user.id,
        subject,
        interestLevel
      }
    })

    return NextResponse.json({ interest: newInterest }, { status: 201 })
  } catch (error) {
    console.error("Error adding user interest:", error)
    return NextResponse.json({ error: "Failed to add user interest" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const interestId = searchParams.get('id')

    if (!interestId) {
      return NextResponse.json({ error: "Interest ID is required" }, { status: 400 })
    }

    // Delete interest
    await prisma.userInterest.deleteMany({
      where: {
        id: parseInt(interestId),
        userId: user.id // Ensure the interest belongs to the user
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing user interest:", error)
    return NextResponse.json({ error: "Failed to remove user interest" }, { status: 500 })
  }
})
