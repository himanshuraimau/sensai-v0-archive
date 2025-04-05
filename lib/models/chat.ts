import { getDb } from "../db"

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
export function getChatSessions(userId: number): ChatSession[] {
  const db = getDb()
  return db
    .prepare(`
    SELECT * FROM chat_sessions 
    WHERE user_id = ? 
    ORDER BY updated_at DESC
  `)
    .all(userId) as ChatSession[]
}

// Get a chat session by ID
export function getChatSession(sessionId: number): ChatSession | null {
  const db = getDb()
  return db
    .prepare(`
    SELECT * FROM chat_sessions 
    WHERE session_id = ?
  `)
    .get(sessionId) as ChatSession | null
}

// Create a new chat session
export function createChatSession(userId: number, title = "New Chat"): ChatSession {
  const db = getDb()

  const result = db
    .prepare(`
    INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `)
    .run(userId, title)

  const sessionId = result.lastInsertRowid as number

  return getChatSession(sessionId) as ChatSession
}

// Update a chat session
export function updateChatSession(sessionId: number, title: string): boolean {
  const db = getDb()

  const result = db
    .prepare(`
    UPDATE chat_sessions 
    SET title = ?, updated_at = datetime('now')
    WHERE session_id = ?
  `)
    .run(title, sessionId)

  return result.changes > 0
}

// Delete a chat session
export function deleteChatSession(sessionId: number): boolean {
  const db = getDb()

  // Start a transaction
  db.prepare("BEGIN TRANSACTION").run()

  try {
    // Delete messages
    db.prepare(`
      DELETE FROM chat_messages 
      WHERE session_id = ?
    `).run(sessionId)

    // Delete the session
    const result = db
      .prepare(`
      DELETE FROM chat_sessions 
      WHERE session_id = ?
    `)
      .run(sessionId)

    db.prepare("COMMIT").run()

    return result.changes > 0
  } catch (error) {
    db.prepare("ROLLBACK").run()
    throw error
  }
}

// Get all messages for a chat session
export function getChatMessages(sessionId: number): ChatMessage[] {
  const db = getDb()
  return db
    .prepare(`
    SELECT * FROM chat_messages 
    WHERE session_id = ? 
    ORDER BY created_at ASC
  `)
    .all(sessionId) as ChatMessage[]
}

// Add a message to a chat session
export function addChatMessage(sessionId: number, senderType: "user" | "ai", content: string): ChatMessage {
  const db = getDb()

  // Update the session's updated_at timestamp
  db.prepare(`
    UPDATE chat_sessions 
    SET updated_at = datetime('now')
    WHERE session_id = ?
  `).run(sessionId)

  // Add the message
  const result = db
    .prepare(`
    INSERT INTO chat_messages (session_id, sender_type, content, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `)
    .run(sessionId, senderType, content)

  const messageId = result.lastInsertRowid as number

  return db
    .prepare(`
    SELECT * FROM chat_messages 
    WHERE message_id = ?
  `)
    .get(messageId) as ChatMessage
}

// Add feedback to a message
export function addMessageFeedback(messageId: number, feedbackType: "positive" | "negative"): MessageFeedback {
  const db = getDb()

  // Check if feedback already exists
  const existingFeedback = db
    .prepare(`
    SELECT * FROM message_feedback 
    WHERE message_id = ?
  `)
    .get(messageId) as MessageFeedback | undefined

  if (existingFeedback) {
    // Update existing feedback
    db.prepare(`
      UPDATE message_feedback 
      SET feedback_type = ?
      WHERE feedback_id = ?
    `).run(feedbackType, existingFeedback.feedback_id)

    return {
      ...existingFeedback,
      feedback_type: feedbackType,
    }
  }

  // Add new feedback
  const result = db
    .prepare(`
    INSERT INTO message_feedback (message_id, feedback_type, created_at)
    VALUES (?, ?, datetime('now'))
  `)
    .run(messageId, feedbackType)

  const feedbackId = result.lastInsertRowid as number

  return db
    .prepare(`
    SELECT * FROM message_feedback 
    WHERE feedback_id = ?
  `)
    .get(feedbackId) as MessageFeedback
}

// Get feedback for a message
export function getMessageFeedback(messageId: number): MessageFeedback | null {
  const db = getDb()
  return db
    .prepare(`
    SELECT * FROM message_feedback 
    WHERE message_id = ?
  `)
    .get(messageId) as MessageFeedback | null
}

// Save a message to notes
export function saveMessageToNotes(userId: number, messageId: number, noteTitle = "Chat Note"): number {
  const db = getDb()

  // Get the message
  const message = db
    .prepare(`
    SELECT * FROM chat_messages 
    WHERE message_id = ?
  `)
    .get(messageId) as ChatMessage | undefined

  if (!message) {
    throw new Error("Message not found")
  }

  // Start a transaction
  db.prepare("BEGIN TRANSACTION").run()

  try {
    // Create a new note
    const noteResult = db
      .prepare(`
      INSERT INTO notes (user_id, title, content, is_favorite, is_trashed, created_at, updated_at)
      VALUES (?, ?, ?, 0, 0, datetime('now'), datetime('now'))
    `)
      .run(userId, noteTitle, message.content)

    const noteId = noteResult.lastInsertRowid as number

    // Create a saved response record
    db.prepare(`
      INSERT INTO saved_responses (user_id, message_id, note_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(userId, messageId, noteId)

    db.prepare("COMMIT").run()

    return noteId
  } catch (error) {
    db.prepare("ROLLBACK").run()
    throw error
  }
}

// Mock AI response generator
export function generateAIResponse(userMessage: string): string {
  // Simple keyword-based responses
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your AI learning assistant. How can I help you today?"
  }

  if (lowerMessage.includes("machine learning")) {
    return "Machine Learning is a subset of AI that focuses on developing systems that can learn from data. Would you like to know more about specific ML concepts like supervised learning, unsupervised learning, or reinforcement learning?"
  }

  if (lowerMessage.includes("javascript")) {
    return "JavaScript is a versatile programming language primarily used for web development. It allows you to add interactive elements to websites. Would you like to learn about JavaScript basics, frameworks like React or Vue, or more advanced concepts?"
  }

  if (lowerMessage.includes("quiz") || lowerMessage.includes("test")) {
    return "Quizzes are a great way to test your knowledge. We have quizzes available for all subjects. Would you like me to recommend one based on your recent learning? I can suggest quizzes on programming fundamentals, data science, or web development."
  }

  if (lowerMessage.includes("data visualization")) {
    return "Data visualization is the graphical representation of information and data. Some popular tools for data visualization include Tableau, Power BI, D3.js, and Python libraries like Matplotlib and Seaborn. What specific aspect of data visualization are you interested in?"
  }

  if (lowerMessage.includes("react")) {
    return "React is a popular JavaScript library for building user interfaces. It was developed by Facebook and is widely used for creating single-page applications. Would you like to learn about React components, hooks, state management, or how to get started with React?"
  }

  if (lowerMessage.includes("neural network")) {
    \
    return 'Neural networks are computing systems inspired by the biological neural networks in human brains. They consist of layers of interconnected nodes or "neurons" that can learn patterns from data. Would you like to learn about different types of neural networks like CNNs, RNNs, or how they work?";
  }

  // Default response for other queries
  return "That's an interesting topic. Would you like me to provide more information or suggest some learning resources about it? I can help with programming, data science, web development, and many other technical subjects."
}

