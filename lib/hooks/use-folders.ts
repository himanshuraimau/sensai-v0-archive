import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { NoteFolder } from "@/lib/models/notes"

// Fetch all folders
export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders")

      if (!response.ok) {
        throw new Error("Failed to fetch folders")
      }

      const data = await response.json()
      return data.folders as NoteFolder[]
    },
  })
}

// Create a new folder
export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderData: {
      name: string
      iconName?: string
      parentFolderId?: number
    }) => {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      })

      if (!response.ok) {
        throw new Error("Failed to create folder")
      }

      const data = await response.json()
      return data.folder as NoteFolder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

// Update a folder
export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      folderId,
      folderData,
    }: {
      folderId: number
      folderData: {
        name?: string
        iconName?: string
        parentFolderId?: number
      }
    }) => {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      })

      if (!response.ok) {
        throw new Error("Failed to update folder")
      }

      const data = await response.json()
      return data.folder as NoteFolder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

// Delete a folder
export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderId: number) => {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete folder")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

