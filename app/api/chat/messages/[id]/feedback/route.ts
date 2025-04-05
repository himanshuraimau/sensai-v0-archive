import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { addMessageFeedback, getMessageFeedback } from "@/lib/models/chat"

// Get feedback for a message
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const messageId = Number.parseInt(req.url.split("/").slice(-2)[0])

    const feedback = getMessageFeedback(messageId)

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching message feedback:", error)
    return NextResponse.json({ error: "Failed to fetch message feedback" }, { status: 500 })
  }
})

// Add feedback to a message
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const messageId = Number.parseInt(req.url.split("/").slice(-2)[0])
    const { feedbackType } = await req.json()

    if (!feedbackType || !["positive", "negative"].includes(feedbackType)) {
      return NextResponse.json({ error: "Valid feedback type (positive or negative) is required" }, { status: 400 })
    }

    const feedback = addMessageFeedback(messageId, feedbackType as "positive" | "negative")

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error) {
    console.error("Error adding message feedback:", error)
    return NextResponse.json({ error: "Failed to add message feedback" }, { status: 500 })
  }
})

