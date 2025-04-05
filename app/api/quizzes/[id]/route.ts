import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getQuiz } from "@/lib/models/quiz"
import prisma from "@/lib/prisma"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const quizId = Number(req.url.split('/').slice(-1)[0])
    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }
    
    const quiz = await getQuiz(quizId)
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }
    
    // Ensure user has access to this quiz
    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const quizId = Number(req.url.split('/').slice(-1)[0])
    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }
    
    // Verify the quiz belongs to the user
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    })
    
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }
    
    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Delete the quiz and all related records
    await prisma.$transaction([
      prisma.quizAnswer.deleteMany({
        where: {
          question: {
            quizId
          }
        }
      }),
      prisma.quizAttempt.deleteMany({
        where: { quizId }
      }),
      prisma.quizOption.deleteMany({
        where: {
          question: {
            quizId
          }
        }
      }),
      prisma.quizQuestion.deleteMany({
        where: { quizId }
      }),
      prisma.quiz.delete({
        where: { id: quizId }
      })
    ])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    )
  }
})
