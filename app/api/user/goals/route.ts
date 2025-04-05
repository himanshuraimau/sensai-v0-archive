import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const goals = await prisma.userLearningGoal.findMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Error fetching user learning goals:", error)
    return NextResponse.json({ error: "Failed to fetch user learning goals" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { goalType, description } = await req.json()

    if (!goalType) {
      return NextResponse.json({ error: "Goal type is required" }, { status: 400 })
    }

    const goal = await prisma.userLearningGoal.create({
      data: {
        userId: user.id,
        goalType,
        description,
        isActive: true
      }
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error("Error adding user learning goal:", error)
    return NextResponse.json({ error: "Failed to add user learning goal" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const { goalId, goalType, description, isActive } = await req.json()

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
    }

    const goal = await prisma.userLearningGoal.updateMany({
      where: {
        id: parseInt(goalId),
        userId: user.id // Ensure the goal belongs to the user
      },
      data: {
        goalType,
        description,
        isActive
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user learning goal:", error)
    return NextResponse.json({ error: "Failed to update user learning goal" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const goalId = searchParams.get('id')

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
    }

    await prisma.userLearningGoal.deleteMany({
      where: {
        id: parseInt(goalId),
        userId: user.id // Ensure the goal belongs to the user
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user learning goal:", error)
    return NextResponse.json({ error: "Failed to delete user learning goal" }, { status: 500 })
  }
})
