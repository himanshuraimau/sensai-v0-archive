"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useUpdateNote, useToggleNoteFavorite } from "@/lib/hooks/use-notes"
import { useTags } from "@/lib/hooks/use-tags"
import type { NoteWithTags } from "@/lib/models/notes"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Star,
  StarOff,
  CheckCircle2,
  Tag as TagIcon,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Toggle favorite status
  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(
      { noteId: note.note_id, isFavorite: !note.is_favorite },
      {
        onSuccess: () => {
          toast({
            title: note.is_favorite ? "Removed from favorites" : "Added to favorites",
            variant: "default",
          });
        },
        onError: (error) => {
          toast({
            title: "Error updating favorite status",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  // Insert formatting at cursor position
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("note-content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    // Define prefix and suffix based on format
    let prefix = '';
    let suffix = '';
    
    switch(format) {
      case 'bold': prefix = '**'; suffix = '**'; break;
      case 'italic': prefix = '*'; suffix = '*'; break;
      case 'underline': prefix = '__'; suffix = '__'; break;
      case 'list': prefix = '- '; break;
      case 'orderedlist': prefix = '1. '; break;
      case 'h1': prefix = '# '; break;
      case 'h2': prefix = '## '; break;
      case 'h3': prefix = '### '; break;
      case 'quote': prefix = '> '; break;
      case 'code': prefix = '```\n'; suffix = '\n```'; break;
      case 'link': prefix = '['; suffix = '](url)'; break;
    }
    
    const newContent = beforeText + prefix + selectedText + suffix + afterText;
    setContent(newContent);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Handle tag selection
  const handleTagSelection = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="border-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex items-center gap-2">
          {isSaving ? (
            <Badge variant="outline" className="text-xs">
              Saving...
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Saved
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="h-8 w-8 p-0"
          >
            {note.is_favorite ? (
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b px-3 py-1">
        <FormatButton icon={<Bold className="h-4 w-4" />} onClick={() => insertFormatting('bold')} tooltip="Bold" />
        <FormatButton icon={<Italic className="h-4 w-4" />} onClick={() => insertFormatting('italic')} tooltip="Italic" />
        <FormatButton icon={<Underline className="h-4 w-4" />} onClick={() => insertFormatting('underline')} tooltip="Underline" />
        <div className="mx-1 h-4 w-px bg-border" />
        <FormatButton icon={<Heading1 className="h-4 w-4" />} onClick={() => insertFormatting('h1')} tooltip="Heading 1" />
        <FormatButton icon={<Heading2 className="h-4 w-4" />} onClick={() => insertFormatting('h2')} tooltip="Heading 2" />
        <FormatButton icon={<Heading3 className="h-4 w-4" />} onClick={() => insertFormatting('h3')} tooltip="Heading 3" />
        <div className="mx-1 h-4 w-px bg-border" />
        <FormatButton icon={<List className="h-4 w-4" />} onClick={() => insertFormatting('list')} tooltip="Bullet List" />
        <FormatButton icon={<ListOrdered className="h-4 w-4" />} onClick={() => insertFormatting('orderedlist')} tooltip="Numbered List" />
        <div className="mx-1 h-4 w-px bg-border" />
        <FormatButton icon={<Quote className="h-4 w-4" />} onClick={() => insertFormatting('quote')} tooltip="Quote" />
        <FormatButton icon={<Code className="h-4 w-4" />} onClick={() => insertFormatting('code')} tooltip="Code Block" />
        <FormatButton icon={<LinkIcon className="h-4 w-4" />} onClick={() => insertFormatting('link')} tooltip="Link" />
        <div className="mx-1 h-4 w-px bg-border" />
        
        {/* Rest of formatting toolbar with tag dropdown remains unchanged */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex h-8 gap-1 px-2">
              <TagIcon className="h-4 w-4" />
              <span>Tags</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tagsLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Loading tags...</div>
            ) : allTags.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No tags available</div>
            ) : (
              allTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag.tag_id}
                  checked={selectedTags.includes(tag.tag_id)}
                  onCheckedChange={() => handleTagSelection(tag.tag_id)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color || '#888888' }}
                    />
                    {tag.name}
                  </span>
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b px-3 py-1">
          {allTags
            .filter(tag => selectedTags.includes(tag.tag_id))
            .map(tag => (
              <Badge
                key={tag.tag_id}
                variant="outline"
                className="flex items-center gap-1 text-xs"
                style={{ borderColor: tag.color || undefined }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tag.color || '#888888' }}
                />
                {tag.name}
              </Badge>
            ))}
        </div>
      )}

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="border-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0 mb-4"
          />
          
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note here..."
            className="min-h-[300px] w-full resize-none border-0 bg-transparent focus:outline-none"
          />
        </div>
      </ScrollArea>
    </div>
  );
}

