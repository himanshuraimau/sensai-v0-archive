import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSession, getChatMessages, processUserMessage } from "@/lib/models/chat"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const sessionId = Number(req.url.split('/').slice(-2)[0])
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    
    const session = await getChatSession(sessionId)
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    const messages = await getChatMessages(sessionId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const sessionId = Number(req.url.split('/').slice(-2)[0])
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }
    
    const session = await getChatSession(sessionId)
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    const body = await req.json()
    const { content } = body
    
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }
    
    // This will add the user message and generate/add the AI response
    const result = await processUserMessage(sessionId, content)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
})
