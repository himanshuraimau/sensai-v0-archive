import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { addMessageFeedback } from "@/lib/models/chat"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const messageId = Number(req.url.split('/').slice(-2)[0])
    if (isNaN(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }
    
    const body = await req.json()
    const { feedbackType } = body
    
    if (!feedbackType || (feedbackType !== "positive" && feedbackType !== "negative")) {
      return NextResponse.json({ error: "Valid feedback type is required" }, { status: 400 })
    }
    
    const feedback = await addMessageFeedback(messageId, feedbackType)
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error adding message feedback:", error)
    return NextResponse.json(
      { error: "Failed to add feedback" },
      { status: 500 }
    )
  }
})
