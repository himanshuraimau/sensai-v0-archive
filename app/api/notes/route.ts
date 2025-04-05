import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNotes, createNote } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)

    const options = {
      folderId: searchParams.get("folderId") ? Number.parseInt(searchParams.get("folderId") as string) : undefined,
      isFavorite: searchParams.get("favorite") === "true",
      isTrashed: searchParams.get("trash") === "true",
      searchQuery: searchParams.get("search") || undefined,
      tagId: searchParams.get("tagId") ? Number.parseInt(searchParams.get("tagId") as string) : undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset") as string) : undefined,
    }

    const notes = getNotes(user.user_id, options)

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { title, content, folderId, tags } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const note = createNote(user.user_id, title, content, folderId, tags)

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
})

