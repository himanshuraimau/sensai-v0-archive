import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getChatSessions, createChatSession } from "@/lib/models/chat"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const sessions = await getChatSessions(user.id)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { title } = body
    
    const session = await createChatSession(user.id, title)
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error creating chat session:", error)
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    )
  }
})
