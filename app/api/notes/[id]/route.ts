import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNote, updateNote, trashNote, restoreNote, deleteNote, toggleNoteFavorite } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const noteId = Number.parseInt(req.url.split("/").pop() as string)

    const note = getNote(noteId)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the user
    if (note.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const noteId = Number.parseInt(req.url.split("/").pop() as string)
    const { title, content, folderId, tags, is_favorite, is_trashed } = await req.json()

    const note = getNote(noteId)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the user
    if (note.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedNote = updateNote(
      noteId,
      {
        title,
        content,
        folder_id: folderId,
        is_favorite,
        is_trashed,
      },
      tags,
    )

    return NextResponse.json({ note: updatedNote })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const noteId = Number.parseInt(req.url.split("/").pop() as string)
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get("permanent") === "true"

    const note = getNote(noteId)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the user
    if (note.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let success

    if (permanent) {
      // Permanently delete the note
      success = deleteNote(noteId)
    } else {
      // Move to trash
      success = trashNote(noteId)
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
})

// Additional routes for specific actions

// PATCH /api/notes/[id]/restore - Restore from trash
export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const noteId = Number.parseInt(req.url.split("/").pop() as string)
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    const note = getNote(noteId)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the user
    if (note.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let success

    if (action === "restore") {
      success = restoreNote(noteId)
    } else if (action === "favorite") {
      success = toggleNoteFavorite(noteId)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: `Failed to ${action} note` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
})

