import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSession, updateChatSession, deleteChatSession } from "@/lib/models/chat"

// Get a specific chat session
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const sessionId = Number.parseInt(req.url.split("/").pop() as string)

    const session = getChatSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    if (session.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error fetching chat session:", error)
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 })
  }
})

// Update a chat session
export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const sessionId = Number.parseInt(req.url.split("/").pop() as string)
    const { title } = await req.json()

    const session = getChatSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    if (session.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const success = updateChatSession(sessionId, title)

    if (!success) {
      return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 })
    }

    const updatedSession = getChatSession(sessionId)

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error("Error updating chat session:", error)
    return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 })
  }
})

// Delete a chat session
export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const sessionId = Number.parseInt(req.url.split("/").pop() as string)

    const session = getChatSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    if (session.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const success = deleteChatSession(sessionId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 })
  }
})

