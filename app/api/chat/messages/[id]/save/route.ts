import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { saveMessageToNotes } from "@/lib/models/chat"

// Save a message to notes
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const messageId = Number.parseInt(req.url.split("/").slice(-2)[0])
    const { title } = await req.json()

    const noteId = saveMessageToNotes(user.user_id, messageId, title || "Chat Note")

    return NextResponse.json({ noteId }, { status: 201 })
  } catch (error) {
    console.error("Error saving message to notes:", error)
    return NextResponse.json({ error: "Failed to save message to notes" }, { status: 500 })
  }
})

