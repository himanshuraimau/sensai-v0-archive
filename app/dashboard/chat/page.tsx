"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Send, Smile, Download, Trash2, ThumbsUp, ThumbsDown, Save } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useNotesStore } from "@/lib/store/notes-store"
import { 
  useChatSessions, 
  useCreateChatSession, 
  useChatMessages, 
  useSendMessage,
  useAddMessageFeedback,
  useSaveMessageToNotes
} from "@/lib/hooks/use-chat"
import { Markdown } from "@/components/ui/markdown"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  feedback?: "positive" | "negative"
}

const quickReplies = [
  "What is machine learning?",
  "How do I start learning JavaScript?",
  "Explain data visualization techniques",
  "What are the best resources for React?",
  "Help me understand neural networks",
  "What's the difference between SQL and NoSQL?",
]

const emojis = ["😊", "👍", "🎉", "🤔", "💡", "✨", "🚀", "👏", "🙌", "❤️"]

export default function ChatPage() {
  const { toast } = useToast()
  const { saveFromChat } = useNotesStore()
  
  // Use the React Query hooks
  const { data: sessions, isLoading: sessionsLoading } = useChatSessions()
  const createChatSession = useCreateChatSession()
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const { data: chatMessages, isLoading: messagesLoading } = useChatMessages(currentSessionId)
  const sendMessage = useSendMessage()
  const addFeedback = useAddMessageFeedback()
  const saveToNotes = useSaveMessageToNotes()
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Convert API messages to local format
  const messages: Message[] = chatMessages ? chatMessages.map(msg => ({
    id: String(msg.message_id),
    content: msg.content,
    sender: msg.sender_type,
    timestamp: new Date(msg.created_at)
  })) : []

  // Initialize chat session if none exists
  useEffect(() => {
    if (!sessionsLoading && sessions && sessions.length === 0) {
      createChatSession.mutate(undefined, {
        onSuccess: (session) => {
          setCurrentSessionId(session.session_id)
        }
      })
    } else if (!sessionsLoading && sessions && sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].session_id)
    }
  }, [sessionsLoading, sessions, currentSessionId])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    // Only scroll to bottom when new messages arrive or when typing status changes
    if (messages.length > 0 || isTyping) {
      scrollToBottom()
    }
  }, [messages.length, isTyping])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSessionId) return

    setInputValue("")
    setIsTyping(true)

    try {
      await sendMessage.mutateAsync({
        sessionId: currentSessionId,
        content: inputValue
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
  }

  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    addFeedback.mutate({
      messageId: parseInt(messageId),
      feedbackType: type
    }, {
      onSuccess: () => {
        toast({
          title: "Feedback received",
          description: "Thank you for your feedback on this response."
        })
      }
    })
  }

  const handleClearChat = async () => {
    // Create a new session
    try {
      const newSession = await createChatSession.mutateAsync(undefined)
      setCurrentSessionId(newSession.session_id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create a new chat session.",
        variant: "destructive",
      })
    }
  }

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => `[${msg.timestamp.toLocaleString()}] ${msg.sender === "user" ? "You" : "AI"}: ${msg.content}`)
      .join("\n\n")

    const blob = new Blob([chatText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Chat exported",
      description: "Your conversation has been exported as a text file.",
    })
  }

  const handleSaveToNotes = (messageId: string) => {
    saveToNotes.mutate({
      messageId: parseInt(messageId),
      title: "Chat Note"
    }, {
      onSuccess: () => {
        toast({
          title: "Saved to notes",
          description: "The message has been saved to your notes."
        })
      }
    })
  }

  return (
    <div className="flex h-full flex-col p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Learning Assistant</h1>
          <p className="text-muted-foreground">Ask questions, get explanations, and deepen your understanding</p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExportChat}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleClearChat}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Clear chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div 
          className="flex-1 overflow-y-auto p-4" 
          ref={chatContainerRef}
        >
          <div className="space-y-4">
            {messages.length === 0 && !messagesLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No messages yet. Start a conversation by sending a message.
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex max-w-[80%] items-start gap-3">
                  {message.sender === "ai" && (
                    <Avatar className="mt-1">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <div className={`px-4 py-2 ${message.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                      {message.sender === "ai" ? (
                        <Markdown content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                      {message.sender === "ai" && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSaveToNotes(message.id)}
                            title="Save to notes"
                          >
                            <Save className="h-3 w-3" />
                            <span className="sr-only">Save to notes</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleFeedback(message.id, "positive")}
                            disabled={message.feedback !== undefined || addFeedback.isPending}
                          >
                            <ThumbsUp
                              className={`h-3 w-3 ${message.feedback === "positive" ? "fill-primary text-primary" : ""}`}
                            />
                            <span className="sr-only">Helpful</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleFeedback(message.id, "negative")}
                            disabled={message.feedback !== undefined || addFeedback.isPending}
                          >
                            <ThumbsDown
                              className={`h-3 w-3 ${message.feedback === "negative" ? "fill-primary text-primary" : ""}`}
                            />
                            <span className="sr-only">Not helpful</span>
                          </Button>
                        </div>
                      )}
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="mt-1">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            
            {(isTyping || sendMessage.isPending) && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] items-start gap-3">
                  <Avatar className="mt-1">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="chat-bubble-ai flex items-center gap-1 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                        ●
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                        ●
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" size="icon" variant="ghost">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Insert emoji</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start" alignOffset={-40} sideOffset={5}>
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessage.isPending || !currentSessionId}
            />

            <Button 
              type="button" 
              size="icon" 
              variant="outline" 
              className="h-10 w-10 rounded-full" 
              disabled={true}
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>

            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!inputValue.trim() || sendMessage.isPending || !currentSessionId}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
