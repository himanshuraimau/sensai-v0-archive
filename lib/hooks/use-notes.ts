import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { NoteWithTags } from "@/lib/models/notes"

// Fetch all notes
export function useNotes(
  options: {
    folderId?: number
    isFavorite?: boolean
    isTrashed?: boolean
    searchQuery?: string
    tagId?: number
  } = {},
) {
  return useQuery({
    queryKey: ["notes", options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.folderId) params.append("folderId", options.folderId.toString())
      if (options.isFavorite !== undefined) params.append("favorite", options.isFavorite.toString())
      if (options.isTrashed !== undefined) params.append("trash", options.isTrashed.toString())
      if (options.searchQuery) params.append("search", options.searchQuery)
      if (options.tagId) params.append("tagId", options.tagId.toString())

      const response = await fetch(`/api/notes?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }

      const data = await response.json()
      return data.notes as NoteWithTags[]
    },
  })
}

// Fetch a single note
export function useNote(noteId: number | null) {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId) return null

      const response = await fetch(`/api/notes/${noteId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch note")
      }

      const data = await response.json()
      return data.note as NoteWithTags
    },
    enabled: !!noteId,
  })
}

// Create a new note
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteData: {
      title: string
      content?: string
      folderId?: number
      tags?: number[]
    }) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        throw new Error("Failed to create note")
      }

      const data = await response.json()
      return data.note as NoteWithTags
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

// Update a note
export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      noteId,
      noteData,
    }: {
      noteId: number
      noteData: {
        title?: string
        content?: string
        folderId?: number
        tags?: number[]
        is_favorite?: boolean
        is_trashed?: boolean
      }
    }) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        throw new Error("Failed to update note")
      }

      const data = await response.json()
      return data.note as NoteWithTags
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note", variables.noteId] })
    },
  })
}

// Delete a note
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      noteId,
      permanent = false,
    }: {
      noteId: number
      permanent?: boolean
    }) => {
      const url = permanent ? `/api/notes/${noteId}?permanent=true` : `/api/notes/${noteId}`

      const response = await fetch(url, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

// Toggle favorite status
export function useToggleNoteFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}?action=favorite`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle favorite status")
      }

      return { success: true }
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note", noteId] })
    },
  })
}

// Restore a note from trash
export function useRestoreNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}?action=restore`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to restore note")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

