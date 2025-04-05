import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { 
  getUserQuizzes, 
  generateQuiz, 
  generatePersonalizedQuizzes
} from "@/lib/models/quiz"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const quizzes = await getUserQuizzes(user.id)
    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { difficulty, generateMultiple, questionCount } = await req.json()
    
    if (generateMultiple) {
      // Generate multiple quizzes based on user interests
      const quizzes = await generatePersonalizedQuizzes(user.id)
      return NextResponse.json({ quizzes })
    } else {
      // Generate a single quiz with optional question count
      const quiz = await generateQuiz(
        user.id, 
        difficulty || "beginner",
        questionCount || undefined
      )
      return NextResponse.json({ quiz })
    }
  } catch (error) {
    console.error("Error generating quiz:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
})
