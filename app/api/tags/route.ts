import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNoteTags, createNoteTag } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const tags = getNoteTags(user.user_id)
    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { name, colorCode } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!colorCode) {
      return NextResponse.json({ error: "Color code is required" }, { status: 400 })
    }

    const tag = createNoteTag(user.user_id, name, colorCode)

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
})

