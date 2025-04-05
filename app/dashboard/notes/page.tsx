"use client"

import { useState, useEffect } from "react"
import { useNotesStore } from "@/lib/store/notes-store"
import { NotesSidebar } from "@/components/notes/notes-sidebar"
import { NoteEditor } from "@/components/notes/note-editor"
import { EmptyNotesState } from "@/components/notes/empty-notes-state"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNotes, useCreateNote } from "@/lib/hooks/use-notes"
import { useAuth } from "@/lib/hooks/use-auth"

export default function NotesPage() {
  const { user } = useAuth()
  const { selectedNoteId, selectedFolderId, setSelectedNote, searchQuery } = useNotesStore()
  const [options, setOptions] = useState({
    folderId:
      selectedFolderId !== "all" && selectedFolderId !== "favorites"
        ? Number.parseInt(selectedFolderId as string)
        : undefined,
    isFavorite: selectedFolderId === "favorites",
    isTrashed: false,
    searchQuery: searchQuery || undefined,
  })

  // Update options when store values change
  useEffect(() => {
    setOptions({
      folderId:
        selectedFolderId !== "all" && selectedFolderId !== "favorites"
          ? Number.parseInt(selectedFolderId as string)
          : undefined,
      isFavorite: selectedFolderId === "favorites",
      isTrashed: false,
      searchQuery: searchQuery || undefined,
    })
  }, [selectedFolderId, searchQuery])

  // Fetch notes with React Query
  const { data: notes = [], isLoading } = useNotes(options)
  const createNoteMutation = useCreateNote()

  // Create a new note
  const handleCreateNote = () => {
    createNoteMutation.mutate(
      {
        title: "Untitled Note",
        content: "",
        folderId: options.folderId,
      },
      {
        onSuccess: (newNote) => {
          setSelectedNote(newNote.note_id.toString())
        },
      },
    )
  }

  // Get the currently selected note
  const selectedNote = notes.find((note) => note.note_id.toString() === selectedNoteId)

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen">
      <NotesSidebar notes={notes} isLoading={isLoading} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Button onClick={handleCreateNote} size="sm" disabled={createNoteMutation.isPending}>
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading notes...</p>
            </div>
          ) : selectedNote ? (
            <NoteEditor note={selectedNote} />
          ) : (
            <EmptyNotesState onCreateNote={handleCreateNote} />
          )}
        </div>
      </div>
    </div>
  )
}

