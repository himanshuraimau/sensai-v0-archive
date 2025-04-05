import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { generatePersonalizedQuizzes } from "@/lib/models/quiz"
import { getUserInterests } from "@/lib/models/user"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    // Check if user has completed onboarding
    const interests = await getUserInterests(user.id)
    
    if (!interests || interests.length === 0) {
      return NextResponse.json({ 
        error: "User has not completed onboarding. Please add interests first." 
      }, { status: 400 })
    }
    
    // Generate quizzes based on user's interests
    const quizzes = await generatePersonalizedQuizzes(user.id)
    
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${quizzes.length} quizzes based on your interests.`,
      quizzes
    })
  } catch (error) {
    console.error("Error generating quizzes from onboarding data:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate quizzes"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
})
