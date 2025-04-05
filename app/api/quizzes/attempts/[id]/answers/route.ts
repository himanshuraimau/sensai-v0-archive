import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { submitQuizAnswer } from "@/lib/models/quiz"
import prisma from "@/lib/prisma"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const attemptId = Number(req.url.split('/').slice(-2)[0])
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
    
    if (attempt.completedAt) {
      return NextResponse.json({ error: "Cannot modify completed quiz" }, { status: 400 })
    }
    
    const { questionId, selectedOptionId } = await req.json()
    
    if (!questionId || !selectedOptionId) {
      return NextResponse.json({ error: "Question ID and selected option ID are required" }, { status: 400 })
    }
    
    // Submit the answer
    const answer = await submitQuizAnswer(attemptId, questionId, selectedOptionId)
    
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Error submitting quiz answer:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to submit answer"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
})
