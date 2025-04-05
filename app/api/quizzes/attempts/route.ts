import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getUserQuizAttempts, startQuizAttempt } from "@/lib/models/quiz"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const attempts = await getUserQuizAttempts(user.id)
    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Error fetching quiz attempts:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { quizId } = await req.json()
    
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }
    
    const attempt = await startQuizAttempt(user.id, quizId)
    return NextResponse.json({ attempt })
  } catch (error) {
    console.error("Error starting quiz attempt:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to start quiz attempt"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
})
