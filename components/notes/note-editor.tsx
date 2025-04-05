"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUpdateNote, useToggleNoteFavorite } from "@/lib/hooks/use-notes"
import { useTags } from "@/lib/hooks/use-tags"
import type { NoteWithTags } from "@/lib/models/notes"
import { useToast } from "@/hooks/use-toast"

interface NoteEditorProps {
  note: NoteWithTags
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { data: allTags = [], isLoading: tagsLoading } = useTags();
  const updateNoteMutation = useUpdateNote();
  const toggleFavoriteMutation = useToggleNoteFavorite();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [selectedTags, setSelectedTags] = useState<number[]>(
    note.tags.map(tag => tag.tag_id)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || "");
    setSelectedTags(note.tags.map(tag => tag.tag_id));
  }, [note]);

  // Update note when title or content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content || 
          !arraysEqual(selectedTags, note.tags.map(tag => tag.tag_id))) {
        setIsSaving(true);
        updateNoteMutation.mutate(
          {
            noteId: note.note_id,
            noteData: {
              title,
              content,
              tags: selectedTags,
            },
          },
          {
            onSuccess: () => {
              setIsSaving(false);
            },
            onError: (error) => {
              setIsSaving(false);
              toast({
                title: "Error saving note",
                description: error.message,
                variant: "destructive",
              });
            },
          }
        );
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, selectedTags, note, updateNoteMutation, toast]);

  // Helper function to compare arrays
  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  // Format toolbar button
  const FormatButton = ({
    icon,
    onClick,
    tooltip,
  }: { icon: React.ReactNode; onClick: () => void; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClick}>
            {icon}
          </Button>
        </Tooltip

