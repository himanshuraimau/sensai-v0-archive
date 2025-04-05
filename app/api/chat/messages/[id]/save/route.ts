import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { saveMessageToNotes } from "@/lib/models/chat"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const messageId = Number(req.url.split('/').slice(-2)[0])
    if (isNaN(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }
    
    const body = await req.json()
    const { title } = body
    
    const noteId = await saveMessageToNotes(user.id, messageId, title)
    return NextResponse.json({ noteId })
  } catch (error) {
    console.error("Error saving message to notes:", error)
    return NextResponse.json(
      { error: "Failed to save message to notes" },
      { status: 500 }
    )
  }
})
