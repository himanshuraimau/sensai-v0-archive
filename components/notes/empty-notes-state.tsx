"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

interface EmptyNotesStateProps {
  onCreateNote: () => void
}

export function EmptyNotesState({ onCreateNote }: EmptyNotesStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No note selected</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Select a note from the sidebar or create a new one to get started.
      </p>
      <Button onClick={onCreateNote}>
        <Plus className="h-4 w-4 mr-2" />
        Create New Note
      </Button>
    </div>
  )
}

