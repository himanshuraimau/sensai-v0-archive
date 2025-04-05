import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getQuizAttempt, completeQuizAttempt } from "@/lib/models/quiz"
import prisma from "@/lib/prisma"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const attemptId = Number(req.url.split('/').slice(-1)[0])
    if (isNaN(attemptId)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 })
    }
    
    const attempt = await getQuizAttempt(attemptId)
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }
    
    // Ensure user has access to this attempt
    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    return NextResponse.json({ attempt })
  } catch (error) {
    console.error("Error fetching quiz attempt:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz attempt" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const attemptId = Number(req.url.split('/').slice(-1)[0])
    if (isNaN(attemptId)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 })
    }
    
    // Verify the attempt belongs to the user
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
    })
    
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }
    
    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Complete the attempt and calculate score
    const completedAttempt = await completeQuizAttempt(attemptId)
    
    return NextResponse.json({ attempt: completedAttempt })
  } catch (error) {
    console.error("Error completing quiz attempt:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to complete quiz attempt"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
})
