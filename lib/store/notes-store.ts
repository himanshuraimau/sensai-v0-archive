import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export type NoteTag = {
  id: string
  name: string
  color: string
}

export type Note = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[] // Tag IDs
  folderId?: string
  isFavorite: boolean
}

export type Folder = {
  id: string
  name: string
  icon?: string
  parentId?: string
}

interface NotesState {
  notes: Note[]
  folders: Folder[]
  tags: NoteTag[]
  selectedNoteId: string | null
  selectedFolderId: string | null
  searchQuery: string

  // Actions
  addNote: (note: Partial<Note>) => string
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void
  addFolder: (folder: Partial<Folder>) => string
  updateFolder: (id: string, folder: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  addTag: (tag: Partial<NoteTag>) => string
  updateTag: (id: string, tag: Partial<NoteTag>) => void
  deleteTag: (id: string) => void
  setSelectedNote: (id: string | null) => void
  setSelectedFolder: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleFavorite: (id: string) => void
  saveFromChat: (content: string) => string
}

// Available tag colors
export const tagColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
]

// Default folders
const defaultFolders: Folder[] = [
  { id: "all", name: "All Notes", icon: "FileText" },
  { id: "favorites", name: "Favorites", icon: "Star" },
  { id: "trash", name: "Trash", icon: "Trash2" },
]

// Default tags
const defaultTags: NoteTag[] = [
  { id: "important", name: "Important", color: "bg-red-500" },
  { id: "study", name: "Study", color: "bg-blue-500" },
  { id: "work", name: "Work", color: "bg-green-500" },
  { id: "personal", name: "Personal", color: "bg-purple-500" },
]

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: defaultFolders,
      tags: defaultTags,
      selectedNoteId: null,
      selectedFolderId: "all",
      searchQuery: "",

      addNote: (note) => {
        const id = note.id || uuidv4()
        const now = new Date()
        const newNote: Note = {
          id,
          title: note.title || "Untitled",
          content: note.content || "",
          createdAt: note.createdAt || now,
          updatedAt: note.updatedAt || now,
          tags: note.tags || [],
          folderId: note.folderId,
          isFavorite: note.isFavorite || false,
        }
        set((state) => ({
          notes: [...state.notes, newNote],
          selectedNoteId: id,
        }))
        return id
      },

      updateNote: (id, note) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...note,
                  updatedAt: new Date(),
                }
              : n,
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }))
      },

      addFolder: (folder) => {
        const id = folder.id || uuidv4()
        const newFolder: Folder = {
          id,
          name: folder.name || "Untitled Folder",
          icon: folder.icon,
          parentId: folder.parentId,
        }
        set((state) => ({
          folders: [...state.folders, newFolder],
        }))
        return id
      },

      updateFolder: (id, folder) => {
        // Don't allow updating default folders
        if (["all", "favorites", "trash"].includes(id)) return

        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ...folder,
                }
              : f,
          ),
        }))
      },

      deleteFolder: (id) => {
        // Don't allow deleting default folders
        if (["all", "favorites", "trash"].includes(id)) return

        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          selectedFolderId: state.selectedFolderId === id ? "all" : state.selectedFolderId,
        }))
      },

      addTag: (tag) => {
        const id = tag.id || uuidv4()
        const newTag: NoteTag = {
          id,
          name: tag.name || "New Tag",
          color: tag.color || tagColors[Math.floor(Math.random() * tagColors.length)],
        }
        set((state) => ({
          tags: [...state.tags, newTag],
        }))
        return id
      },

      updateTag: (id, tag) => {
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...tag,
                }
              : t,
          ),
        }))
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          // Remove the tag from all notes
          notes: state.notes.map((note) => ({
            ...note,
            tags: note.tags.filter((tagId) => tagId !== id),
          })),
        }))
      },

      setSelectedNote: (id) => {
        set({ selectedNoteId: id })
      },

      setSelectedFolder: (id) => {
        set({ selectedFolderId: id })
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      toggleFavorite: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  isFavorite: !note.isFavorite,
                }
              : note,
          ),
        }))
      },

      saveFromChat: (content) => {
        const id = uuidv4()
        const now = new Date()
        const title = content.split("\n")[0].substring(0, 50) || "Chat Note"

        const newNote: Note = {
          id,
          title,
          content,
          createdAt: now,
          updatedAt: now,
          tags: [],
          isFavorite: false,
        }

        set((state) => ({
          notes: [...state.notes, newNote],
        }))

        return id
      },
    }),
    {
      name: "sensi-ai-notes",
    },
  ),
)

