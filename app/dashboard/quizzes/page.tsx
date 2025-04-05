"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText } from "lucide-react"
import Link from "next/link"

const quizzes = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics",
    questions: 10,
    timeEstimate: "15 min",
    difficulty: "Beginner",
    category: "Programming",
  },
  {
    id: "2",
    title: "Machine Learning Concepts",
    description: "Review core machine learning algorithms and concepts",
    questions: 15,
    timeEstimate: "25 min",
    difficulty: "Intermediate",
    category: "Data Science",
  },
  {
    id: "3",
    title: "React Component Patterns",
    description: "Test your understanding of React component design patterns",
    questions: 12,
    timeEstimate: "20 min",
    difficulty: "Advanced",
    category: "Programming",
  },
  {
    id: "4",
    title: "Data Visualization Principles",
    description: "Evaluate your knowledge of effective data visualization techniques",
    questions: 8,
    timeEstimate: "12 min",
    difficulty: "Intermediate",
    category: "Data Science",
  },
]

const completedQuizzes = [
  {
    id: "5",
    title: "HTML & CSS Basics",
    description: "Fundamentals of web markup and styling",
    score: 85,
    completedDate: "2 days ago",
    category: "Web Development",
  },
  {
    id: "6",
    title: "Python Syntax",
    description: "Basic Python programming concepts",
    score: 92,
    completedDate: "1 week ago",
    category: "Programming",
  },
]

export default function QuizzesPage() {
  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge and track your progress</p>
      </header>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Quizzes</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedQuizzes.map((quiz) => (
              <CompletedQuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QuizCard({ quiz }: { quiz: (typeof quizzes)[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Badge
            variant={
              quiz.difficulty === "Beginner" ? "outline" : quiz.difficulty === "Intermediate" ? "secondary" : "default"
            }
          >
            {quiz.difficulty}
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.questions} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.timeEstimate}</span>
          </div>
        </div>
        <Badge variant="outline" className="mt-4">
          {quiz.category}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/quizzes/${quiz.id}`}>Start Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function CompletedQuizCard({ quiz }: { quiz: (typeof completedQuizzes)[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Badge variant={quiz.score >= 90 ? "default" : quiz.score >= 70 ? "secondary" : "outline"}>
            {quiz.score}%
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>Completed {quiz.completedDate}</span>
          </div>
        </div>
        <Badge variant="outline" className="mt-4">
          {quiz.category}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/dashboard/quizzes/${quiz.id}/results`}>View Results</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

