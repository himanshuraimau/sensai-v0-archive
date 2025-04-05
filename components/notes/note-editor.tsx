"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNotesStore, type Note } from "@/lib/store/notes-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  LinkIcon,
  Star,
  TagIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NoteEditorProps {
  note: Note
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote, tags, toggleFavorite } = useNotesStore()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [selectedTags, setSelectedTags] = useState<string[]>(note.tags)

  // Update note when title or content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateNote(note.id, {
        title,
        content,
        tags: selectedTags,
      })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [title, content, selectedTags, note.id, updateNote])

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
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Insert formatting at cursor position
  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("note-content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const beforeText = content.substring(0, start)
    const afterText = content.substring(end)

    const newContent = beforeText + prefix + selectedText + suffix + afterText
    setContent(newContent)

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              note.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => toggleFavorite(note.id)}
          >
            <Star className={cn("h-5 w-5", note.isFavorite && "fill-yellow-500")} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Last edited {format(new Date(note.updatedAt), "MMM d, yyyy h:mm a")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <TagIcon className="h-4 w-4" />
                <span>Tags</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {tags.map((tag) => (
                <DropdownMenuItem key={tag.id} onClick={() => toggleTag(tag.id)} className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", tag.color)} />
                  <span>{tag.name}</span>
                  {selectedTags.includes(tag.id) && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 py-2 border-b">
          {selectedTags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId)
            if (!tag) return null

            return (
              <div key={tag.id} className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted">
                <div className={cn("h-2 w-2 rounded-full", tag.color)} />
                <span>{tag.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 p-2 border-b">
        <FormatButton icon={<Bold className="h-4 w-4" />} onClick={() => insertFormatting("**", "**")} tooltip="Bold" />
        <FormatButton
          icon={<Italic className="h-4 w-4" />}
          onClick={() => insertFormatting("*", "*")}
          tooltip="Italic"
        />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <FormatButton
          icon={<Heading1 className="h-4 w-4" />}
          onClick={() => insertFormatting("# ")}
          tooltip="Heading 1"
        />
        <FormatButton
          icon={<Heading2 className="h-4 w-4" />}
          onClick={() => insertFormatting("## ")}
          tooltip="Heading 2"
        />
        <FormatButton
          icon={<Heading3 className="h-4 w-4" />}
          onClick={() => insertFormatting("### ")}
          tooltip="Heading 3"
        />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <FormatButton
          icon={<List className="h-4 w-4" />}
          onClick={() => insertFormatting("- ")}
          tooltip="Bullet List"
        />
        <FormatButton
          icon={<ListOrdered className="h-4 w-4" />}
          onClick={() => insertFormatting("1. ")}
          tooltip="Numbered List"
        />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <FormatButton icon={<Quote className="h-4 w-4" />} onClick={() => insertFormatting("> ")} tooltip="Quote" />
        <FormatButton
          icon={<Code className="h-4 w-4" />}
          onClick={() => insertFormatting("```\n", "\n```")}
          tooltip="Code Block"
        />
        <FormatButton
          icon={<LinkIcon className="h-4 w-4" />}
          onClick={() => insertFormatting("[", "](url)")}
          tooltip="Link"
        />
      </div>

      {/* Note content */}
      <div className="flex-1 overflow-auto p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-xl font-bold border-none px-0 mb-4 focus-visible:ring-0"
        />

        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full min-h-[300px] resize-none border-none focus:outline-none bg-transparent"
        />
      </div>
    </div>
  )
}

