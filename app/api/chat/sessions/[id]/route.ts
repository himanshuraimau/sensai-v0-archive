import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSession, deleteChatSession, updateChatSession } from "@/lib/models/chat"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const id = Number(req.url.split('/').pop())
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    
    const session = await getChatSession(id)
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error fetching chat session:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const id = Number(req.url.split('/').pop())
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    
    const session = await getChatSession(id)
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    const success = await deleteChatSession(id)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    )
  }
})

export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const id = Number(req.url.split('/').pop())
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    
    const session = await getChatSession(id)
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    const body = await req.json()
    const { title } = body
    
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    const success = await updateChatSession(id, title)
    
    if (success) {
      const updatedSession = await getChatSession(id)
      return NextResponse.json({ session: updatedSession })
    } else {
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating chat session:", error)
    return NextResponse.json(
      { error: "Failed to update chat session" },
      { status: 500 }
    )
  }
})
