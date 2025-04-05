"use client"

import { useState, useEffect } from "react"
import { useNotesStore } from "@/lib/store/notes-store"
import { NotesSidebar } from "@/components/notes/notes-sidebar"
import { NoteEditor } from "@/components/notes/note-editor"
import { EmptyNotesState } from "@/components/notes/empty-notes-state"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function NotesPage() {
  const { notes, selectedNoteId, selectedFolderId, addNote, setSelectedNote, searchQuery } = useNotesStore()

  const [filteredNotes, setFilteredNotes] = useState(notes)

  // Filter notes based on selected folder and search query
  useEffect(() => {
    let filtered = notes

    // Filter by folder
    if (selectedFolderId === "favorites") {
      filtered = filtered.filter((note) => note.isFavorite)
    } else if (selectedFolderId !== "all") {
      filtered = filtered.filter((note) => note.folderId === selectedFolderId)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query),
      )
    }

    setFilteredNotes(filtered)
  }, [notes, selectedFolderId, searchQuery])

  // Create a new note
  const handleCreateNote = () => {
    const id = addNote({
      title: "Untitled Note",
      content: "",
      folderId: selectedFolderId !== "favorites" && selectedFolderId !== "all" ? selectedFolderId : undefined,
    })
    setSelectedNote(id)
  }

  // Get the currently selected note
  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  return (
    <div className="flex h-screen">
      <NotesSidebar notes={filteredNotes} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Button onClick={handleCreateNote} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {selectedNote ? <NoteEditor note={selectedNote} /> : <EmptyNotesState onCreateNote={handleCreateNote} />}
        </div>
      </div>
    </div>
  )
}

