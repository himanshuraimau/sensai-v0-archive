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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI learning assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: getAIResponse(inputValue),
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsLoading(false)
      }, 500)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    // Simple response logic - in a real app, this would call an AI API
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! How can I assist with your learning today?"
    } else if (input.includes("machine learning")) {
      return "Machine Learning is a subset of AI that focuses on developing systems that can learn from data. Would you like to know more about specific ML concepts like supervised learning, unsupervised learning, or reinforcement learning?"
    } else if (input.includes("javascript")) {
      return "JavaScript is a versatile programming language primarily used for web development. It allows you to add interactive elements to websites. Would you like to learn about JavaScript basics, frameworks like React or Vue, or more advanced concepts?"
    } else if (input.includes("quiz") || input.includes("test")) {
      return "Quizzes are a great way to test your knowledge. We have quizzes available for all subjects. Would you like me to recommend one based on your recent learning? I can suggest quizzes on programming fundamentals, data science, or web development."
    } else if (input.includes("data visualization")) {
      return "Data visualization is the graphical representation of information and data. Some popular tools for data visualization include Tableau, Power BI, D3.js, and Python libraries like Matplotlib and Seaborn. What specific aspect of data visualization are you interested in?"
    } else if (input.includes("react")) {
      return "React is a popular JavaScript library for building user interfaces. It was developed by Facebook and is widely used for creating single-page applications. Would you like to learn about React components, hooks, state management, or how to get started with React?"
    } else if (input.includes("neural network")) {
      return 'Neural networks are computing systems inspired by the biological neural networks in human brains. They consist of layers of interconnected nodes or "neurons" that can learn patterns from data. Would you like to learn about different types of neural networks like CNNs, RNNs, or how they work?'
    } else {
      return "That's an interesting topic. Would you like me to provide more information or suggest some learning resources about it? I can help with programming, data science, web development, and many other technical subjects."
    }
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
  }

  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, feedback: type } : message)))

    toast({
      title: "Feedback received",
      description: "Thank you for your feedback on this response.",
    })
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: "Hello! I'm your AI learning assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
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
    const message = messages.find((msg) => msg.id === messageId)
    if (!message) return

    const noteId = saveFromChat(message.content)

    toast({
      title: "Saved to notes",
      description: "The message has been saved to your notes.",
    })
  }

  return (
    <div className="flex h-screen flex-col p-6">
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
        <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
          <div className="space-y-4">
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
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
                            disabled={message.feedback !== undefined}
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
                            disabled={message.feedback !== undefined}
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
            {isTyping && (
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
              disabled={isLoading}
            />

            <Button type="button" size="icon" variant="outline" className="h-10 w-10 rounded-full" disabled={isLoading}>
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>

            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!inputValue.trim() || isLoading}
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

