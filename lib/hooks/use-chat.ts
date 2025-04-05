import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface ChatSession {
  session_id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
}

interface ChatMessage {
  message_id: number
  session_id: number
  sender_type: "user" | "ai"
  content: string
  created_at: string
}

interface MessageFeedback {
  feedback_id: number
  message_id: number
  feedback_type: "positive" | "negative"
  created_at: string
}

// Fetch all chat sessions
export function useChatSessions() {
  return useQuery({
    queryKey: ["chatSessions"],
    queryFn: async () => {
      const response = await fetch("/api/chat/sessions")

      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions")
      }

      const data = await response.json()
      return data.sessions as ChatSession[]
    },
  })
}

// Create a new chat session
export function useCreateChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title?: string) => {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create chat session")
      }

      const data = await response.json()
      return data.session as ChatSession
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
    },
  })
}

// Delete a chat session
export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat session")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
    },
  })
}

// Fetch messages for a chat session
export function useChatMessages(sessionId: number | null) {
  return useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      if (!sessionId) return []

      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`)

      if (!response.ok) {
        throw new Error("Failed to fetch chat messages")
      }

      const data = await response.json()
      return data.messages as ChatMessage[]
    },
    enabled: !!sessionId,
  })
}

// Send a message and get AI response
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      content,
    }: {
      sessionId: number
      content: string
    }) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      return {
        userMessage: data.userMessage as ChatMessage,
        aiMessage: data.aiMessage as ChatMessage,
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
    },
  })
}

// Add feedback to a message
export function useAddMessageFeedback() {
  return useMutation({
    mutationFn: async ({
      messageId,
      feedbackType,
    }: {
      messageId: number
      feedbackType: "positive" | "negative"
    }) => {
      const response = await fetch(`/api/chat/messages/${messageId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackType }),
      })

      if (!response.ok) {
        throw new Error("Failed to add feedback")
      }

      const data = await response.json()
      return data.feedback as MessageFeedback
    },
  })
}

// Save a message to notes
export function useSaveMessageToNotes() {
  return useMutation({
    mutationFn: async ({
      messageId,
      title,
    }: {
      messageId: number
      title?: string
    }) => {
      const response = await fetch(`/api/chat/messages/${messageId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to save message to notes")
      }

      const data = await response.json()
      return { noteId: data.noteId as number }
    },
  })
}

