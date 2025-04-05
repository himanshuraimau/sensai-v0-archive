import prisma from "../prisma"
import { getDb } from "../db"

export interface NoteFolder {
  folder_id: number
  user_id: number
  name: string
  icon_name?: string
  parent_folder_id?: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface NoteTag {
  tag_id: number
  user_id: number
  name: string
  color_code: string
  created_at: string
}

export interface Note {
  note_id: number
  user_id: number
  title: string
  content?: string
  folder_id?: number
  is_favorite: boolean
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export interface NoteWithTags extends Note {
  tags: NoteTag[]
}

// Get all note folders for a user
export function getNoteFolders(userId: number): NoteFolder[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM note_folders WHERE user_id = ? ORDER BY is_default DESC, name ASC")
    .all(userId) as NoteFolder[]
}

// Get a note folder by ID
export function getNoteFolder(folderId: number): NoteFolder | null {
  const db = getDb()
  return db.prepare("SELECT * FROM note_folders WHERE folder_id = ?").get(folderId) as NoteFolder | null
}

// Create a note folder
export function createNoteFolder(userId: number, name: string, iconName?: string, parentFolderId?: number): NoteFolder {
  const db = getDb()

  const result = db
    .prepare(`
    INSERT INTO note_folders (user_id, name, icon_name, parent_folder_id, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))
  `)
    .run(userId, name, iconName || null, parentFolderId || null)

  const folderId = result.lastInsertRowid as number

  return getNoteFolder(folderId) as NoteFolder
}

// Update a note folder
export function updateNoteFolder(folderId: number, updates: Partial<NoteFolder>): NoteFolder | null {
  const db = getDb()

  // Don't allow updating default folders
  const folder = getNoteFolder(folderId)
  if (!folder || folder.is_default) {
    return folder
  }

  // Build the SET part of the SQL query dynamically
  const updateFields = Object.keys(updates)
    .filter((key) => key !== "folder_id" && key !== "user_id" && key !== "is_default" && key !== "created_at")
    .map((key) => `${key} = ?`)

  updateFields.push('updated_at = datetime("now")')

  if (updateFields.length === 1) {
    // Only updated_at
    return folder
  }

  const updateValues = Object.keys(updates)
    .filter((key) => key !== "folder_id" && key !== "user_id" && key !== "is_default" && key !== "created_at")
    .map((key) => updates[key as keyof typeof updates])

  const sql = `UPDATE note_folders SET ${updateFields.join(", ")} WHERE folder_id = ?`

  db.prepare(sql).run(...updateValues, folderId)

  return getNoteFolder(folderId)
}

// Delete a note folder
export function deleteNoteFolder(folderId: number): boolean {
  const db = getDb()

  // Don't allow deleting default folders
  const folder = getNoteFolder(folderId)
  if (!folder || folder.is_default) {
    return false
  }

  // Move notes to the default "All Notes" folder
  const allNotesFolder = db
    .prepare(`
    SELECT * FROM note_folders 
    WHERE user_id = ? AND name = 'All Notes' AND is_default = 1
  `)
    .get(folder.user_id) as NoteFolder | undefined

  if (allNotesFolder) {
    db.prepare(`
      UPDATE notes SET folder_id = ? WHERE folder_id = ?
    `).run(allNotesFolder.folder_id, folderId)
  }

  // Delete the folder
  const result = db.prepare("DELETE FROM note_folders WHERE folder_id = ?").run(folderId)
  return result.changes > 0
}

// Get all note tags for a user
export function getNoteTags(userId: number): NoteTag[] {
  const db = getDb()
  return db.prepare("SELECT * FROM note_tags WHERE user_id = ? ORDER BY name ASC").all(userId) as NoteTag[]
}

// Get a note tag by ID
export function getNoteTag(tagId: number): NoteTag | null {
  const db = getDb()
  return db.prepare("SELECT * FROM note_tags WHERE tag_id = ?").get(tagId) as NoteTag | null
}

// Create a note tag
export function createNoteTag(userId: number, name: string, colorCode: string): NoteTag {
  const db = getDb()

  const result = db
    .prepare(`
    INSERT INTO note_tags (user_id, name, color_code, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `)
    .run(userId, name, colorCode)

  const tagId = result.lastInsertRowid as number

  return getNoteTag(tagId) as NoteTag
}

// Update a note tag
export function updateNoteTag(tagId: number, updates: Partial<NoteTag>): NoteTag | null {
  const db = getDb()

  // Build the SET part of the SQL query dynamically
  const updateFields = Object.keys(updates)
    .filter((key) => key !== "tag_id" && key !== "user_id" && key !== "created_at")
    .map((key) => `${key} = ?`)

  if (updateFields.length === 0) {
    return getNoteTag(tagId)
  }

  const updateValues = Object.keys(updates)
    .filter((key) => key !== "tag_id" && key !== "user_id" && key !== "created_at")
    .map((key) => updates[key as keyof typeof updates])

  const sql = `UPDATE note_tags SET ${updateFields.join(", ")} WHERE tag_id = ?`

  db.prepare(sql).run(...updateValues, tagId)

  return getNoteTag(tagId)
}

// Delete a note tag
export function deleteNoteTag(tagId: number): boolean {
  const db = getDb()

  // Delete tag relations first
  db.prepare("DELETE FROM note_tag_relations WHERE tag_id = ?").run(tagId)

  // Delete the tag
  const result = db.prepare("DELETE FROM note_tags WHERE tag_id = ?").run(tagId)
  return result.changes > 0
}

// Get all notes for a user
export function getNotes(
  userId: number,
  options: {
    folderId?: number
    isFavorite?: boolean
    isTrashed?: boolean
    searchQuery?: string
    tagId?: number
    limit?: number
    offset?: number
  } = {},
): NoteWithTags[] {
  const db = getDb()

  let sql = `
    SELECT n.* FROM notes n
  `

  const params: any[] = [userId]

  // Join with tag relations if filtering by tag
  if (options.tagId) {
    sql += `
      JOIN note_tag_relations ntr ON n.note_id = ntr.note_id
      WHERE n.user_id = ? AND ntr.tag_id = ?
    `
    params.push(options.tagId)
  } else {
    sql += ` WHERE n.user_id = ?`
  }

  // Add folder filter
  if (options.folderId !== undefined) {
    sql += ` AND n.folder_id = ?`
    params.push(options.folderId)
  }

  // Add favorite filter
  if (options.isFavorite !== undefined) {
    sql += ` AND n.is_favorite = ?`
    params.push(options.isFavorite ? 1 : 0)
  }

  // Add trash filter
  if (options.isTrashed !== undefined) {
    sql += ` AND n.is_trashed = ?`
    params.push(options.isTrashed ? 1 : 0)
  } else {
    // By default, exclude trashed notes
    sql += ` AND n.is_trashed = 0`
  }

  // Add search filter
  if (options.searchQuery) {
    sql += ` AND (n.title LIKE ? OR n.content LIKE ?)`
    const searchTerm = `%${options.searchQuery}%`
    params.push(searchTerm, searchTerm)
  }

  // Order by updated_at
  sql += ` ORDER BY n.updated_at DESC`

  // Add pagination
  if (options.limit) {
    sql += ` LIMIT ?`
    params.push(options.limit)

    if (options.offset) {
      sql += ` OFFSET ?`
      params.push(options.offset)
    }
  }

  const notes = db.prepare(sql).all(...params) as Note[]

  // Get tags for each note
  return notes.map((note) => {
    const tags = db
      .prepare(`
      SELECT nt.* FROM note_tags nt
      JOIN note_tag_relations ntr ON nt.tag_id = ntr.tag_id
      WHERE ntr.note_id = ?
    `)
      .all(note.note_id) as NoteTag[]

    return {
      ...note,
      tags,
    }
  })
}

// Get a note by ID
export function getNote(noteId: number): NoteWithTags | null {
  const db = getDb()

  const note = db.prepare("SELECT * FROM notes WHERE note_id = ?").get(noteId) as Note | undefined

  if (!note) {
    return null
  }

  // Get tags for the note
  const tags = db
    .prepare(`
    SELECT nt.* FROM note_tags nt
    JOIN note_tag_relations ntr ON nt.tag_id = ntr.tag_id
    WHERE ntr.note_id = ?
  `)
    .all(noteId) as NoteTag[]

  return {
    ...note,
    tags,
  }
}

// Create a note
export function createNote(
  userId: number,
  title: string,
  content?: string,
  folderId?: number,
  tags?: number[],
): NoteWithTags {
  const db = getDb()

  // Start a transaction
  db.prepare("BEGIN TRANSACTION").run()

  try {
    // Insert the note
    const result = db
      .prepare(`
      INSERT INTO notes (user_id, title, content, folder_id, is_favorite, is_trashed, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
    `)
      .run(userId, title, content || "", folderId || null)

    const noteId = result.lastInsertRowid as number

    // Add tags if provided
    if (tags && tags.length > 0) {
      const insertTagRelation = db.prepare(`
        INSERT INTO note_tag_relations (note_id, tag_id)
        VALUES (?, ?)
      `)

      for (const tagId of tags) {
        insertTagRelation.run(noteId, tagId)
      }
    }

    // Create initial version
    db.prepare(`
      INSERT INTO note_versions (note_id, content, created_at)
      VALUES (?, ?, datetime('now'))
    `).run(noteId, content || "")

    db.prepare("COMMIT").run()

    return getNote(noteId) as NoteWithTags
  } catch (error) {
    db.prepare("ROLLBACK").run()
    throw error
  }
}

// Update a note
export function updateNote(noteId: number, updates: Partial<Note>, newTags?: number[]): NoteWithTags | null {
  const db = getDb()

  // Get the current note
  const currentNote = getNote(noteId)
  if (!currentNote) {
    return null
  }

  // Start a transaction
  db.prepare("BEGIN TRANSACTION").run()

  try {
    // Build the SET part of the SQL query dynamically
    const updateFields = Object.keys(updates)
      .filter((key) => key !== "note_id" && key !== "user_id" && key !== "created_at")
      .map((key) => `${key} = ?`)

    updateFields.push('updated_at = datetime("now")')

    if (updateFields.length > 1) {
      // More than just updated_at
      const updateValues = Object.keys(updates)
        .filter((key) => key !== "note_id" && key !== "user_id" && key !== "created_at")
        .map((key) => updates[key as keyof typeof updates])

      const sql = `UPDATE notes SET ${updateFields.join(", ")} WHERE note_id = ?`

      db.prepare(sql).run(...updateValues, noteId)

      // Create a new version if content was updated
      if (updates.content !== undefined && updates.content !== currentNote.content) {
        db.prepare(`
          INSERT INTO note_versions (note_id, content, created_at)
          VALUES (?, ?, datetime('now'))
        `).run(noteId, updates.content)
      }
    }

    // Update tags if provided
    if (newTags !== undefined) {
      // Remove existing tag relations
      db.prepare("DELETE FROM note_tag_relations WHERE note_id = ?").run(noteId)

      // Add new tag relations
      if (newTags.length > 0) {
        const insertTagRelation = db.prepare(`
          INSERT INTO note_tag_relations (note_id, tag_id)
          VALUES (?, ?)
        `)

        for (const tagId of newTags) {
          insertTagRelation.run(noteId, tagId)
        }
      }
    }

    db.prepare("COMMIT").run()

    return getNote(noteId)
  } catch (error) {
    db.prepare("ROLLBACK").run()
    throw error
  }
}

// Delete a note (move to trash)
export async function trashNote(noteId: number): Promise<boolean> {
  try {
    const result = await prisma.note.update({
      where: { id: noteId },
      data: {
        isTrashed: true,
        updatedAt: new Date()
      }
    })
    
    return !!result
  } catch (error) {
    console.error("Error trashing note:", error)
    return false
  }
}

// Restore a note from trash
export async function restoreNote(noteId: number): Promise<boolean> {
  try {
    const result = await prisma.note.update({
      where: { id: noteId },
      data: {
        isTrashed: false,
        updatedAt: new Date()
      }
    })
    
    return !!result
  } catch (error) {
    console.error("Error restoring note:", error)
    return false
  }
}

// Permanently delete a note
export async function deleteNote(noteId: number): Promise<boolean> {
  try {
    // Use Prisma transaction to delete related data
    await prisma.$transaction(async (tx) => {
      // Delete tag relations
      await tx.noteTagRelation.deleteMany({
        where: { noteId }
      })
      
      // Delete versions
      await tx.noteVersion.deleteMany({
        where: { noteId }
      })
      
      // Delete the note
      await tx.note.delete({
        where: { id: noteId }
      })
    })
    
    return true
  } catch (error) {
    console.error("Error deleting note:", error)
    return false
  }
}

// Toggle favorite status
export function toggleNoteFavorite(noteId: number): boolean {
  const db = getDb()

  const note = getNote(noteId)
  if (!note) {
    return false
  }

  const result = db
    .prepare(`
    UPDATE notes SET is_favorite = ?, updated_at = datetime('now')
    WHERE note_id = ?
  `)
    .run(note.is_favorite ? 0 : 1, noteId)

  return result.changes > 0
}

// Get note versions
export interface NoteVersion {
  version_id: number
  note_id: number
  content: string
  created_at: string
}

export function getNoteVersions(noteId: number): NoteVersion[] {
  const db = getDb()

  return db
    .prepare(`
    SELECT * FROM note_versions
    WHERE note_id = ?
    ORDER BY created_at DESC
  `)
    .all(noteId) as NoteVersion[]
}

