"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Filter, Bookmark, BookmarkPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const learningContent = [
  {
    id: "1",
    title: "Introduction to Neural Networks",
    description: "Learn the fundamentals of neural networks and how they work",
    type: "Article",
    readTime: "10 min",
    category: "Machine Learning",
    isNew: true,
  },
  {
    id: "2",
    title: "Building RESTful APIs with Node.js",
    description: "A comprehensive guide to creating robust APIs with Node.js and Express",
    type: "Tutorial",
    readTime: "25 min",
    category: "Web Development",
    isNew: false,
  },
  {
    id: "3",
    title: "Data Visualization Best Practices",
    description: "Learn how to create effective and insightful data visualizations",
    type: "Video",
    readTime: "15 min",
    category: "Data Science",
    isNew: true,
  },
  {
    id: "4",
    title: "Advanced JavaScript Patterns",
    description: "Explore advanced design patterns and techniques in JavaScript",
    type: "Article",
    readTime: "12 min",
    category: "Programming",
    isNew: false,
  },
  {
    id: "5",
    title: "Introduction to React Hooks",
    description: "Learn how to use React Hooks to manage state and side effects",
    type: "Tutorial",
    readTime: "20 min",
    category: "Web Development",
    isNew: false,
  },
  {
    id: "6",
    title: "Machine Learning for Beginners",
    description: "A gentle introduction to machine learning concepts and applications",
    type: "Video",
    readTime: "30 min",
    category: "Machine Learning",
    isNew: false,
  },
]

const savedContent = [
  {
    id: "2",
    title: "Building RESTful APIs with Node.js",
    description: "A comprehensive guide to creating robust APIs with Node.js and Express",
    type: "Tutorial",
    readTime: "25 min",
    category: "Web Development",
    savedDate: "2 days ago",
  },
  {
    id: "5",
    title: "Introduction to React Hooks",
    description: "Learn how to use React Hooks to manage state and side effects",
    type: "Tutorial",
    readTime: "20 min",
    category: "Web Development",
    savedDate: "1 week ago",
  },
]

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [savedItems, setSavedItems] = useState<string[]>(savedContent.map((item) => item.id))

  const filteredContent = learningContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSaveItem = (id: string) => {
    if (savedItems.includes(id)) {
      setSavedItems((prev) => prev.filter((itemId) => itemId !== id))
    } else {
      setSavedItems((prev) => [...prev, id])
    }
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>
        <p className="text-muted-foreground">Explore articles, tutorials, and videos to enhance your knowledge</p>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search for topics, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                isSaved={savedItems.includes(item.id)}
                onSave={() => handleSaveItem(item.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Bookmark className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">No saved content</h3>
              <p className="text-sm text-muted-foreground">Items you save will appear here for easy access</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedContent
                .filter((item) => savedItems.includes(item.id))
                .map((item) => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    isSaved={true}
                    onSave={() => handleSaveItem(item.id)}
                    savedDate={item.savedDate}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContentCard({
  content,
  isSaved,
  onSave,
  savedDate,
}: {
  content: (typeof learningContent)[0]
  isSaved: boolean
  onSave: () => void
  savedDate?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{content.title}</CardTitle>
            <CardDescription className="mt-1">{content.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onSave} className="text-muted-foreground hover:text-foreground">
            {isSaved ? <Bookmark className="h-5 w-5 fill-current" /> : <BookmarkPlus className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline">{content.type}</Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{content.readTime}</span>
          </div>
          {content.isNew && <Badge>New</Badge>}
          {savedDate && <span className="text-xs text-muted-foreground">Saved {savedDate}</span>}
        </div>
        <Badge variant="secondary" className="mt-4">
          {content.category}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/learn/${content.id}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            {content.type === "Video" ? "Watch" : "Read"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

