import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { saveUserOnboarding } from "@/lib/models/user"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { interests, learningGoals } = await req.json()

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json({ error: "At least one interest is required" }, { status: 400 })
    }

    if (!learningGoals || !Array.isArray(learningGoals) || learningGoals.length === 0) {
      return NextResponse.json({ error: "At least one learning goal is required" }, { status: 400 })
    }

    // Use 'id' instead of 'user_id' based on the Prisma schema
    const onboardingData = await saveUserOnboarding(user.id, { interests, learningGoals })

    return NextResponse.json({ 
      success: true,
      data: onboardingData 
    }, { status: 200 })
  } catch (error) {
    console.error("Error saving onboarding data:", error)
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 })
  }
})
