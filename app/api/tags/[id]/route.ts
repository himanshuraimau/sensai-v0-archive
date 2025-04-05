import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNoteTag, updateNoteTag, deleteNoteTag } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const tagId = Number.parseInt(req.url.split("/").pop() as string)

    const tag = getNoteTag(tagId)

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check if the tag belongs to the user
    if (tag.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error("Error fetching tag:", error)
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const tagId = Number.parseInt(req.url.split("/").pop() as string)
    const { name, colorCode } = await req.json()

    const tag = getNoteTag(tagId)

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check if the tag belongs to the user
    if (tag.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedTag = updateNoteTag(tagId, {
      name,
      color_code: colorCode,
    })

    return NextResponse.json({ tag: updatedTag })
  } catch (error) {
    console.error("Error updating tag:", error)
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const tagId = Number.parseInt(req.url.split("/").pop() as string)

    const tag = getNoteTag(tagId)

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check if the tag belongs to the user
    if (tag.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const success = deleteNoteTag(tagId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 })
  }
})

