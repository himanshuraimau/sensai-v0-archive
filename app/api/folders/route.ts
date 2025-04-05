import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNoteFolders, createNoteFolder } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const folders = getNoteFolders(user.user_id)
    return NextResponse.json({ folders })
  } catch (error) {
    console.error("Error fetching folders:", error)
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { name, iconName, parentFolderId } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const folder = createNoteFolder(user.user_id, name, iconName, parentFolderId)

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error) {
    console.error("Error creating folder:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
})

