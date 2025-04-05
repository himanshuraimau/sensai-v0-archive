import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { NoteTag } from "@/lib/models/notes"

// Fetch all tags
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags")

      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }

      const data = await response.json()
      return data.tags as NoteTag[]
    },
  })
}

// Create a new tag
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tagData: {
      name: string
      colorCode: string
    }) => {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      })

      if (!response.ok) {
        throw new Error("Failed to create tag")
      }

      const data = await response.json()
      return data.tag as NoteTag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}

// Update a tag
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tagId,
      tagData,
    }: {
      tagId: number
      tagData: {
        name?: string
        colorCode?: string
      }
    }) => {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      })

      if (!response.ok) {
        throw new Error("Failed to update tag")
      }

      const data = await response.json()
      return data.tag as NoteTag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}

// Delete a tag
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tagId: number) => {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete tag")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}

