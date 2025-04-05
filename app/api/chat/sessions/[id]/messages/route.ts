import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSession, getChatMessages, addChatMessage, generateAIResponse } from "@/lib/models/chat"

// Get all messages for a chat session
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const parts = req.url.split("/")
    const sessionId = Number.parseInt(parts[parts.length - 2])

    const session = getChatSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    if (session.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const messages = getChatMessages(sessionId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 })
  }
})

// Add a message to a chat session
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const parts = req.url.split("/")
    const sessionId = Number.parseInt(parts[parts.length - 2])
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const session = getChatSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    if (session.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Add the user message
    const userMessage = addChatMessage(sessionId, "user", content)

    // Generate AI response
    const aiResponse = generateAIResponse(content)

    // Add the AI message
    const aiMessage = addChatMessage(sessionId, "ai", aiResponse)

    return NextResponse.json(
      {
        userMessage,
        aiMessage,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding chat message:", error)
    return NextResponse.json({ error: "Failed to add chat message" }, { status: 500 })
  }
})

