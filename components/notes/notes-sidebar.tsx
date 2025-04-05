"use client"

import type React from "react"

import { useState } from "react"
import { useNotesStore, type Note, type Folder, type NoteTag } from "@/lib/store/notes-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  FolderIcon,
  FileText,
  Star,
  Trash2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NotesSidebarProps {
  notes: Note[]
}

export function NotesSidebar({ notes }: NotesSidebarProps) {
  const {
    folders,
    tags,
    selectedNoteId,
    selectedFolderId,
    setSelectedNote,
    setSelectedFolder,
    setSearchQuery,
    addFolder,
    addTag,
  } = useNotesStore()

  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-blue-500")
  const [expandedSections, setExpandedSections] = useState({
    folders: true,
    tags: true,
  })

  // Toggle section expansion
  const toggleSection = (section: "folders" | "tags") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder({ name: newFolderName })
      setNewFolderName("")
      setIsAddingFolder(false)
    }
  }

  // Handle tag creation
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      addTag({ name: newTagName, color: newTagColor })
      setNewTagName("")
      setIsAddingTag(false)
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-8" onChange={handleSearch} />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Default folders */}
            {folders
              .filter((folder) => ["all", "favorites", "trash"].includes(folder.id))
              .map((folder) => (
                <SidebarItem
                  key={folder.id}
                  icon={getFolderIcon(folder)}
                  label={folder.name}
                  isActive={selectedFolderId === folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                />
              ))}
          </div>

          <Separator className="my-4" />

          {/* Custom folders */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => toggleSection("folders")}
            >
              <div className="flex items-center text-sm font-medium">
                {expandedSections.folders ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Folders
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAddingFolder(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {expandedSections.folders && (
              <div className="space-y-1 ml-2">
                {folders
                  .filter((folder) => !["all", "favorites", "trash"].includes(folder.id))
                  .map((folder) => (
                    <SidebarItem
                      key={folder.id}
                      icon={<FolderIcon className="h-4 w-4" />}
                      label={folder.name}
                      isActive={selectedFolderId === folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      actions={<FolderActions folder={folder} />}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => toggleSection("tags")}
            >
              <div className="flex items-center text-sm font-medium">
                {expandedSections.tags ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Tags
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAddingTag(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {expandedSections.tags && (
              <div className="space-y-1 ml-2">
                {tags.map((tag) => (
                  <SidebarItem
                    key={tag.id}
                    icon={<div className={cn("h-3 w-3 rounded-full", tag.color)} />}
                    label={tag.name}
                    onClick={() => {
                      // Filter by tag logic would go here
                    }}
                    actions={<TagActions tag={tag} />}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Notes list */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            {notes.length > 0 ? (
              notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={selectedNoteId === note.id}
                  onClick={() => setSelectedNote(note.id)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground px-2 py-1">No notes found</p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Add Folder Dialog */}
      <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap gap-2">
                {["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"].map(
                  (color) => (
                    <div
                      key={color}
                      className={cn(
                        "h-6 w-6 rounded-full cursor-pointer border-2",
                        color,
                        newTagColor === color ? "border-black dark:border-white" : "border-transparent",
                      )}
                      onClick={() => setNewTagColor(color)}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTag(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get folder icon
function getFolderIcon(folder: Folder) {
  switch (folder.id) {
    case "all":
      return <FileText className="h-4 w-4" />
    case "favorites":
      return <Star className="h-4 w-4" />
    case "trash":
      return <Trash2 className="h-4 w-4" />
    default:
      return <FolderIcon className="h-4 w-4" />
  }
}

// Sidebar item component
interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  actions?: React.ReactNode
}

function SidebarItem({ icon, label, isActive, onClick, actions }: SidebarItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1.5 text-sm rounded-md",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {actions}
    </div>
  )
}

// Note item component
interface NoteItemProps {
  note: Note
  isActive: boolean
  onClick: () => void
}

function NoteItem({ note, isActive, onClick }: NoteItemProps) {
  const { tags, toggleFavorite } = useNotesStore()

  // Get tags for this note
  const noteTags = tags.filter((tag) => note.tags.includes(tag.id))

  return (
    <div
      className={cn(
        "flex flex-col px-2 py-1.5 text-sm rounded-md",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{note.title}</span>
        <div className="flex items-center">
          {note.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />}
          <NoteActions note={note} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
        <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
        {noteTags.length > 0 && (
          <div className="flex gap-1">
            {noteTags.slice(0, 2).map((tag) => (
              <div key={tag.id} className={cn("h-2 w-2 rounded-full", tag.color)} />
            ))}
            {noteTags.length > 2 && <span>+{noteTags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// Folder actions component
function FolderActions({ folder }: { folder: Folder }) {
  const { updateFolder, deleteFolder } = useNotesStore()

  // Don't show actions for default folders
  if (["all", "favorites", "trash"].includes(folder.id)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            const newName = prompt("Enter new folder name", folder.name)
            if (newName) updateFolder(folder.id, { name: newName })
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this folder?")) {
              deleteFolder(folder.id)
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Tag actions component
function TagActions({ tag }: { tag: NoteTag }) {
  const { updateTag, deleteTag } = useNotesStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            const newName = prompt("Enter new tag name", tag.name)
            if (newName) updateTag(tag.id, { name: newName })
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this tag?")) {
              deleteTag(tag.id)
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Note actions component
function NoteActions({ note }: { note: Note }) {
  const { updateNote, deleteNote, toggleFavorite } = useNotesStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggleFavorite(note.id)}>
          {note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const newTitle = prompt("Enter new note title", note.title)
            if (newTitle) updateNote(note.id, { title: newTitle })
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this note?")) {
              deleteNote(note.id)
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

