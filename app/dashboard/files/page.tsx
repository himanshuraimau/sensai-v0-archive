"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  File,
  FileText,
  FileImage,
  FileIcon as FilePdf,
  FileArchive,
  Upload,
  MoreHorizontal,
  Trash,
  Download,
  Share,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

const initialFiles = [
  {
    id: "1",
    name: "JavaScript Notes.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "2 days ago",
    category: "Programming",
  },
  {
    id: "2",
    name: "Data Science Project.zip",
    type: "zip",
    size: "15.8 MB",
    uploadDate: "1 week ago",
    category: "Data Science",
  },
  {
    id: "3",
    name: "React Component Diagram.png",
    type: "image",
    size: "1.2 MB",
    uploadDate: "3 days ago",
    category: "Web Development",
  },
  {
    id: "4",
    name: "Machine Learning Notes.txt",
    type: "text",
    size: "45 KB",
    uploadDate: "Today",
    category: "Machine Learning",
  },
  {
    id: "5",
    name: "Web Development Cheatsheet.pdf",
    type: "pdf",
    size: "3.1 MB",
    uploadDate: "5 days ago",
    category: "Web Development",
  },
]

export default function FilesPage() {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileList, setFileList] = useState(initialFiles)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length) {
      uploadFiles(droppedFiles)
    }
  }

  const handleFileSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      uploadFiles(selectedFiles)
    }
  }

  const uploadFiles = (filesToUpload: FileList) => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setUploadProgress(null), 1000)

          const newFiles = Array.from(filesToUpload).map((f, index) => ({
            id: `${Date.now()}-${index}`,
            name: f.name,
            type: getFileType(f),
            size: formatFileSize(f.size),
            uploadDate: "Just now",
            category: "Uncategorized",
          }))
          setFileList((prev) => [...newFiles, ...prev])
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const getFileType = (file: File) => {
    if (file.type.includes("pdf")) return "pdf"
    if (file.type.includes("zip")) return "zip"
    if (file.type.includes("image")) return "image"
    if (file.type.includes("text")) return "text"
    return "unknown"
  }

  const formatFileSize = (size: number) => {
    const kb = size / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground">Upload and manage your learning materials</p>
      </header>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card
            className={`border-2 border-dashed transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">Upload Files</h3>
              <p className="mb-4 text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
              <Button onClick={handleFileSelectClick}>Select Files</Button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFilesSelected}
              />
              {uploadProgress !== null && (
                <div className="mt-4 w-full max-w-xs space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Files</CardTitle>
              <CardDescription>Manage your uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fileList.map((file) => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Uploaded</CardTitle>
              <CardDescription>Files you've uploaded in the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fileList
                  .filter((file) =>
                    ["Today", "2 days ago", "3 days ago", "Just now"].includes(file.uploadDate)
                  )
                  .map((file) => (
                    <FileItem key={file.id} file={file} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CategoryCard title="Programming" count={fileList.filter(f => f.category === "Programming").length} icon={<FileText className="h-5 w-5" />} />
            <CategoryCard title="Data Science" count={fileList.filter(f => f.category === "Data Science").length} icon={<FileArchive className="h-5 w-5" />} />
            <CategoryCard title="Web Development" count={fileList.filter(f => f.category === "Web Development").length} icon={<FileImage className="h-5 w-5" />} />
            <CategoryCard title="Machine Learning" count={fileList.filter(f => f.category === "Machine Learning").length} icon={<File className="h-5 w-5" />} />
            <CategoryCard title="Uncategorized" count={fileList.filter(f => f.category === "Uncategorized").length} icon={<File className="h-5 w-5" />} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FileItem({ file }: { file: (typeof initialFiles)[0] }) {
  const getFileIcon = () => {
    switch (file.type) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "image":
        return <FileImage className="h-5 w-5 text-blue-500" />
      case "zip":
        return <FileArchive className="h-5 w-5 text-yellow-500" />
      case "text":
        return <FileText className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">{getFileIcon()}</div>
        <div>
          <p className="font-medium">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{file.size}</span>
            <span>•</span>
            <span>{file.uploadDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{file.category}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function CategoryCard({
  title,
  count,
  icon,
}: {
  title: string
  count: number
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">{icon}</div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{count} files</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          View
        </Button>
      </CardContent>
    </Card>
  )
}
