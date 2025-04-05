import prisma from "../prisma"
import { OpenAI } from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ChatSession {
  session_id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  message_id: number
  session_id: number
  sender_type: "user" | "ai"
  content: string
  created_at: string
}

export interface MessageFeedback {
  feedback_id: number
  message_id: number
  feedback_type: "positive" | "negative"
  created_at: string
}

// Get all chat sessions for a user
export async function getChatSessions(userId: number): Promise<ChatSession[]> {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  })
  
  return sessions.map(session => ({
    session_id: session.id,
    user_id: session.userId,
    title: session.title || "New Chat",
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString()
  }))
}

// Get a chat session by ID
export async function getChatSession(sessionId: number): Promise<ChatSession | null> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId }
  })
  
  if (!session) return null
  
  return {
    session_id: session.id,
    user_id: session.userId,
    title: session.title || "New Chat",
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString()
  }
}

// Create a new chat session
export async function createChatSession(userId: number, title = "New Chat"): Promise<ChatSession> {
  const session = await prisma.chatSession.create({
    data: {
      userId,
      title
    }
  })
  
  return {
    session_id: session.id,
    user_id: session.userId,
    title: session.title || "New Chat",
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString()
  }
}

// Update a chat session
export async function updateChatSession(sessionId: number, title: string): Promise<boolean> {
  try {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    })
    return true
  } catch (error) {
    console.error("Failed to update chat session:", error)
    return false
  }
}

// Delete a chat session
export async function deleteChatSession(sessionId: number): Promise<boolean> {
  try {
    await prisma.$transaction([
      prisma.messageFeedback.deleteMany({
        where: {
          message: {
            sessionId
          }
        }
      }),
      prisma.chatMessage.deleteMany({
        where: { sessionId }
      }),
      prisma.chatSession.delete({
        where: { id: sessionId }
      })
    ])
    return true
  } catch (error) {
    console.error("Failed to delete chat session:", error)
    return false
  }
}

// Get all messages for a chat session
export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  })
  
  return messages.map(message => ({
    message_id: message.id,
    session_id: message.sessionId,
    sender_type: message.senderType as "user" | "ai",
    content: message.content,
    created_at: message.createdAt.toISOString()
  }))
}

// Add a message to a chat session
export async function addChatMessage(
  sessionId: number, 
  senderType: "user" | "ai", 
  content: string
): Promise<ChatMessage> {
  // Update the session's updated_at timestamp
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() }
  })
  
  // Add the message
  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      senderType,
      content
    }
  })
  
  return {
    message_id: message.id,
    session_id: message.sessionId,
    sender_type: message.senderType as "user" | "ai",
    content: message.content,
    created_at: message.createdAt.toISOString()
  }
}

// Add feedback to a message
export async function addMessageFeedback(
  messageId: number, 
  feedbackType: "positive" | "negative"
): Promise<MessageFeedback> {
  // Check if feedback already exists
  const existingFeedback = await prisma.messageFeedback.findUnique({
    where: { messageId }
  })
  
  if (existingFeedback) {
    // Update existing feedback
    const updatedFeedback = await prisma.messageFeedback.update({
      where: { messageId },
      data: { feedbackType }
    })
    
    return {
      feedback_id: updatedFeedback.id,
      message_id: updatedFeedback.messageId,
      feedback_type: updatedFeedback.feedbackType as "positive" | "negative",
      created_at: updatedFeedback.createdAt.toISOString()
    }
  }
  
  // Add new feedback
  const feedback = await prisma.messageFeedback.create({
    data: {
      messageId,
      feedbackType
    }
  })
  
  return {
    feedback_id: feedback.id,
    message_id: feedback.messageId,
    feedback_type: feedback.feedbackType as "positive" | "negative",
    created_at: feedback.createdAt.toISOString()
  }
}

// Get feedback for a message
export async function getMessageFeedback(messageId: number): Promise<MessageFeedback | null> {
  const feedback = await prisma.messageFeedback.findUnique({
    where: { messageId }
  })
  
  if (!feedback) return null
  
  return {
    feedback_id: feedback.id,
    message_id: feedback.messageId,
    feedback_type: feedback.feedbackType as "positive" | "negative",
    created_at: feedback.createdAt.toISOString()
  }
}

// Save a message to notes
export async function saveMessageToNotes(
  userId: number, 
  messageId: number, 
  noteTitle = "Chat Note"
): Promise<number> {
  // Get the message
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId }
  })
  
  if (!message) {
    throw new Error("Message not found")
  }
  
  // Use a transaction to ensure consistency
  const result = await prisma.$transaction(async (tx) => {
    // Create a new note
    const note = await tx.note.create({
      data: {
        userId,
        title: noteTitle,
        content: message.content,
        isFavorite: false,
        isTrashed: false
      }
    })
    
    // Create a saved response record
    await tx.savedResponse.create({
      data: {
        userId,
        messageId,
        noteId: note.id
      }
    })
    
    return note.id
  })
  
  return result
}

// Generate AI response using OpenAI
export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI learning assistant. Provide helpful, educational responses to user queries.
Focus on topics like programming, data science, machine learning, and other technical subjects.
Format your responses using Markdown for readability:
- Use ## for section headings
- Use \`code\` for inline code
- Use \`\`\` code blocks for multi-line code snippets with appropriate language tags
- Use **bold** for emphasis
- Use bullet points and numbered lists where appropriate
- Use tables when presenting structured data
Keep your responses informative, accurate, and well-structured.`
        },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })
    
    return completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a response. Please try again."
    
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "I apologize, but I'm having trouble processing your request right now. Please try again later."
  }
}

// Process user message and get AI response
export async function processUserMessage(
  sessionId: number, 
  content: string
): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
  // Add user message
  const userMessage = await addChatMessage(sessionId, "user", content)
  
  // Generate AI response
  const aiResponse = await generateAIResponse(content)
  
  // Add AI message
  const aiMessage = await addChatMessage(sessionId, "ai", aiResponse)
  
  return { userMessage, aiMessage }
}

