import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNoteFolder, updateNoteFolder, deleteNoteFolder } from "@/lib/models/notes"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const folderId = Number.parseInt(req.url.split("/").pop() as string)

    const folder = getNoteFolder(folderId)

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Check if the folder belongs to the user
    if (folder.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ folder })
  } catch (error) {
    console.error("Error fetching folder:", error)
    return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const folderId = Number.parseInt(req.url.split("/").pop() as string)
    const { name, iconName, parentFolderId } = await req.json()

    const folder = getNoteFolder(folderId)

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Check if the folder belongs to the user
    if (folder.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Don't allow updating default folders
    if (folder.is_default) {
      return NextResponse.json({ error: "Cannot update default folders" }, { status: 400 })
    }

    const updatedFolder = updateNoteFolder(folderId, {
      name,
      icon_name: iconName,
      parent_folder_id: parentFolderId,
    })

    return NextResponse.json({ folder: updatedFolder })
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const folderId = Number.parseInt(req.url.split("/").pop() as string)

    const folder = getNoteFolder(folderId)

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Check if the folder belongs to the user
    if (folder.user_id !== user.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Don't allow deleting default folders
    if (folder.is_default) {
      return NextResponse.json({ error: "Cannot delete default folders" }, { status: 400 })
    }

    const success = deleteNoteFolder(folderId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
  }
})

