import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSessions, createChatSession } from "@/lib/models/chat"

// Get all chat sessions for the current user
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const sessions = getChatSessions(user.user_id)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 })
  }
})

// Create a new chat session
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { title } = await req.json()

    const session = createChatSession(user.user_id, title || "New Chat")

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat session:", error)
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 })
  }
})

