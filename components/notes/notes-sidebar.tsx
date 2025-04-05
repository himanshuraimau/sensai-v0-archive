"use client"

import type React from "react"

import { useState } from "react"
import { useNotesStore } from "@/lib/store/notes-store"
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
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useFolders, useCreateFolder, useDeleteFolder } from "@/lib/hooks/use-folders"
import { useTags, useCreateTag, useDeleteTag } from "@/lib/hooks/use-tags"
import { useToggleNoteFavorite, useDeleteNote } from "@/lib/hooks/use-notes"
import type { NoteWithTags } from "@/lib/models/notes"
import { useToast } from "@/hooks/use-toast"

interface NotesSidebarProps {
  notes: NoteWithTags[]
  isLoading?: boolean
}

export function NotesSidebar({ notes, isLoading = false }: NotesSidebarProps) {
  const { selectedNoteId, selectedFolderId, setSelectedNote, setSelectedFolder, setSearchQuery } = useNotesStore()

  const { data: folders = [], isLoading: foldersLoading } = useFolders()
  const { data: tags = [], isLoading: tagsLoading } = useTags()
  const createFolder = useCreateFolder()
  const createTag = useCreateTag()
  const deleteFolder = useDeleteFolder()
  const deleteTag = useDeleteTag()
  const toggleFavorite = useToggleNoteFavorite()
  const deleteNoteMutation = useDeleteNote()
  const { toast } = useToast()

  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-blue-500")
  const [expandedSections, setExpandedSections] = useState({
    folders: true,
    tags: true,
  })
  const [searchInputValue, setSearchInputValue] = useState("")

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
      createFolder.mutate(
        { name: newFolderName },
        {
          onSuccess: () => {
            setNewFolderName("")
            setIsAddingFolder(false)
            toast({
              title: "Folder created",
              description: `Folder "${newFolderName}" has been created.`,
            })
          },
          onError: (error) => {
            toast({
              title: "Error creating folder",
              description: error.message,
              variant: "destructive",
            })
          },
        },
      )
    }
  }

  // Handle tag creation
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag.mutate(
        { name: newTagName, colorCode: newTagColor },
        {
          onSuccess: () => {
            setNewTagName("")
            setIsAddingTag(false)
            toast({
              title: "Tag created",
              description: `Tag "${newTagName}" has been created.`,
            })
          },
          onError: (error) => {
            toast({
              title: "Error creating tag",
              description: error.message,
              variant: "destructive",
            })
          },
        },
      )
    }
  }

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchInputValue)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearch}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Default folders */}
            <SidebarItem
              key="all"
              icon={<FileText className="h-4 w-4" />}
              label="All Notes"
              isActive={selectedFolderId === "all"}
              onClick={() => setSelectedFolder("all")}
            />
            <SidebarItem
              key="favorites"
              icon={<Star className="h-4 w-4" />}
              label="Favorites"
              isActive={selectedFolderId === "favorites"}
              onClick={() => setSelectedFolder("favorites")}
            />
            <SidebarItem
              key="trash"
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              isActive={selectedFolderId === "trash"}
              onClick={() => setSelectedFolder("trash")}
            />
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
                {foldersLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  folders
                    .filter((folder) => !["all", "favorites", "trash"].includes(folder.name))
                    .map((folder) => (
                      <SidebarItem
                        key={folder.folder_id}
                        icon={<FolderIcon className="h-4 w-4" />}
                        label={folder.name}
                        isActive={selectedFolderId === folder.folder_id.toString()}
                        onClick={() => setSelectedFolder(folder.folder_id.toString())}
                        actions={
                          <FolderActions
                            folder={folder}
                            onDelete={(id) => {
                              deleteFolder.mutate(id, {
                                onSuccess: () => {
                                  toast({
                                    title: "Folder deleted",
                                    description: `Folder "${folder.name}" has been deleted.`,
                                  })
                                  if (selectedFolderId === id.toString()) {
                                    setSelectedFolder("all")
                                  }
                                },
                              })
                            }}
                          />
                        }
                      />
                    ))
                )}
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
                {tagsLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  tags.map((tag) => (
                    <SidebarItem
                      key={tag.tag_id}
                      icon={<div className={cn("h-3 w-3 rounded-full", tag.color_code)} />}
                      label={tag.name}
                      onClick={() => {
                        // Filter by tag logic would go here
                      }}
                      actions={
                        <TagActions
                          tag={tag}
                          onDelete={(id) => {
                            deleteTag.mutate(id, {
                              onSuccess: () => {
                                toast({
                                  title: "Tag deleted",
                                  description: `Tag "${tag.name}" has been deleted.`,
                                })
                              },
                            })
                          }}
                        />
                      }
                    />
                  ))
                )}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Notes list */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length > 0 ? (
              notes.map((note) => (
                <NoteItem
                  key={note.note_id}
                  note={note}
                  isActive={selectedNoteId === note.note_id.toString()}
                  onClick={() => setSelectedNote(note.note_id.toString())}
                  onToggleFavorite={(id) => {
                    toggleFavorite.mutate(id)
                  }}
                  onDelete={(id) => {
                    deleteNoteMutation.mutate({ noteId: id })
                  }}
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
            <Button onClick={handleCreateFolder} disabled={createFolder.isPending}>
              {createFolder.isPending ? "Creating..." : "Create"}
            </Button>
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
            <Button onClick={handleCreateTag} disabled={createTag.isPending}>
              {createTag.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
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
  note: NoteWithTags
  isActive: boolean
  onClick: () => void
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
}

function NoteItem({ note, isActive, onClick, onToggleFavorite, onDelete }: NoteItemProps) {
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
          {note.is_favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />}
          <NoteActions
            note={note}
            onToggleFavorite={() => onToggleFavorite(note.note_id)}
            onDelete={() => onDelete(note.note_id)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
        <span>{format(new Date(note.updated_at), "MMM d, yyyy")}</span>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <div key={tag.tag_id} className={cn("h-2 w-2 rounded-full", tag.color_code)} />
            ))}
            {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// Folder actions component
function FolderActions({ folder, onDelete }: { folder: any; onDelete: (id: number) => void }) {
  // Don't show actions for default folders
  if (["All Notes", "Favorites", "Trash"].includes(folder.name)) {
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
            if (newName) {
              // updateFolder(folder.id, { name: newName })
            }
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this folder?")) {
              onDelete(folder.folder_id)
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
function TagActions({ tag, onDelete }: { tag: any; onDelete: (id: number) => void }) {
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
            if (newName) {
              // updateTag(tag.id, { name: newName })
            }
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this tag?")) {
              onDelete(tag.tag_id)
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
function NoteActions({
  note,
  onToggleFavorite,
  onDelete,
}: {
  note: NoteWithTags
  onToggleFavorite: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onToggleFavorite}>
          {note.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const newTitle = prompt("Enter new note title", note.title)
            if (newTitle) {
              // updateNote(note.id, { title: newTitle })
            }
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this note?")) {
              onDelete()
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

